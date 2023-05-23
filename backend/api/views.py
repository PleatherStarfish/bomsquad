from shopping_list.serializers import UserShoppingListSerializer
from shopping_list.models import UserShoppingList
from components.serializers import ComponentSerializer
from components.models import Component, ComponentSupplier, Types, ComponentManufacturer
from rest_framework import generics
from django.shortcuts import get_object_or_404
from modules.models import Module, ModuleBomListItem
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.decorators import login_required
from django.middleware import csrf
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.core.paginator import Paginator
from django.http import Http404
from modules.serializers import (
    ModuleSerializer,
    BuiltModuleSerializer,
    WantTooBuildModuleSerializer,
    ManufacturerSerializer,
    SupplierSerializer,
    TypeSerializer,
)
from accounts.models import CustomUser
from modules.models import BuiltModules, WantToBuildModules
from rest_framework import status
from inventory.models import UserInventory
from inventory.serializers import UserInventorySerializer
from modules.serializers import ModuleBomListItemSerializer
from django.db.models import Sum, Q
from accounts.serializers import UserSerializer, UserHistorySerializer
from rest_framework.views import APIView
from django.db.models import F


@api_view(["GET"])
def get_user_me(request):
    user = request.user
    serializer = UserSerializer(user)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user_history(request):
    user = request.user
    serializer = UserHistorySerializer(user)
    return Response(serializer.data)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_user(request):
    user = request.user
    user.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


class ModuleDetailView(generics.RetrieveAPIView):
    """
    API endpoint that retrieves a single Module instance by its slug.
    """

    serializer_class = ModuleSerializer

    def get_object(self):
        # Extract the `slug` parameter from the URL.
        slug = self.kwargs.get("slug")

        # Look up the Module instance with the given `slug`.
        # Raise a 404 error if no such instance exists.
        module_instance = get_object_or_404(Module, slug=slug)

        # Return the retrieved Module instance.
        return module_instance


class UserModulesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, type):
        # Determine which type of modules to return
        if type == "built":
            modules = BuiltModules.objects.filter(user=request.user).order_by(
                "module__name"
            )
            serializer_class = BuiltModuleSerializer
        elif type == "wtb":
            modules = WantToBuildModules.objects.filter(user=request.user).order_by(
                "module__name"
            )
            serializer_class = WantTooBuildModuleSerializer
        else:
            return Response(
                {"error": "Invalid type parameter."}, status=status.HTTP_400_BAD_REQUEST
            )

        # Paginate the results
        paginator = Paginator(modules, 10)  # Show 10 modules per page
        page = request.GET.get("page")
        modules_page = paginator.get_page(page)

        # Serialize the results and return them in the response
        serializer = serializer_class(modules_page, many=True)
        data = {
            "count": paginator.count,
            "num_pages": paginator.num_pages,
            "results": serializer.data,
        }

        # Add "is_built" and "is_wtb" fields to each module
        for module_data in data["results"]:
            module_slug = module_data["module"]["slug"]
            module = get_object_or_404(Module, slug=module_slug)
            is_built = BuiltModules.objects.filter(
                user=request.user, module=module
            ).exists()
            is_wtb = WantToBuildModules.objects.filter(
                user=request.user, module=module
            ).exists()
            module_data["is_built"] = is_built
            module_data["is_wtb"] = is_wtb

        return Response(data)


@permission_classes([IsAuthenticated])
@api_view(["GET"])
def get_user_inventory(request):
    """
    Retrieve the user's own inventory.
    """
    user = request.user
    inventory = UserInventory.objects.filter(user=user)
    serializer = UserInventorySerializer(inventory, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@permission_classes([IsAuthenticated])
@api_view(["POST"])
def user_inventory_quantity_create_or_update(request, component_pk):
    user = request.user

    # Check if the user inventory item exists
    try:
        user_inventory_item = UserInventory.objects.get(
            user=user, component_id=component_pk
        )
    except UserInventory.DoesNotExist:
        user_inventory_item = None

    # Determine the editing mode from request
    edit_mode = request.data.get("editMode", True)

    # If the user inventory item exists, update the quantity
    if user_inventory_item is not None:
        quantity = int(request.data.get("quantity", 0))
        if edit_mode:
            user_inventory_item.quantity = quantity
        else:
            user_inventory_item.quantity += quantity

        user_inventory_item.save()
        serializer = UserInventorySerializer(user_inventory_item)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # If the user inventory item does not exist, create a new one
    try:
        quantity = int(request.data.get("quantity", 0))
        component = Component.objects.get(id=component_pk)
        user_inventory = UserInventory.objects.create(
            user=user, component=component, quantity=quantity
        )
        serializer = UserInventorySerializer(user_inventory)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    except Component.DoesNotExist:
        return Response(
            {"detail": "Component not found"}, status=status.HTTP_404_NOT_FOUND
        )


@permission_classes([IsAuthenticated])
@api_view(["PATCH"])
def user_inventory_update(request, component_pk):
    user = request.user
    user_inventor_item = UserInventory.objects.filter(
        user=user, component__id=component_pk
    ).first()

    if not user_inventor_item:
        return Response(
            {"detail": "User inventory not found"}, status=status.HTTP_404_NOT_FOUND
        )

    serializer = UserInventorySerializer(
        user_inventor_item, data=request.data, partial=True
    )
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@permission_classes([IsAuthenticated])
@api_view(["DELETE"])
def user_inventory_delete(request, component_pk):
    user = request.user
    user_inventory_item = UserInventory.objects.filter(
        user=user, component__id=component_pk
    ).first()

    if not user_inventory_item:
        return Response(
            {"detail": "User inventory not found"}, status=status.HTTP_404_NOT_FOUND
        )

    user_inventory_item.delete()
    return Response(
        {"detail": "User inventory deleted successfully"},
        status=status.HTTP_204_NO_CONTENT,
    )


@permission_classes([IsAuthenticated])
@api_view(["GET"])
def get_user_shopping_list(request):
    """
    Retrieve the user's own shooping list grouped by module.
    """
    user = request.user
    inventory = UserShoppingList.objects.filter(user=user).order_by("module__name")
    serializer = UserShoppingListSerializer(inventory, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@permission_classes([IsAuthenticated])
@api_view(["GET"])
def get_user_inventory_quantity(request, component_pk):
    inventory = UserInventory.objects.filter(
        component__id=component_pk, user=request.user
    )

    # Check if inventory exists
    if inventory.exists():
        # Access the first inventory object in the QuerySet
        # and retrieve the 'quantity' attribute
        quantity = inventory.first().quantity
        return Response({"quantity": quantity}, status=status.HTTP_200_OK)
    else:
        return Response({"quantity": 0}, status=status.HTTP_200_OK)


@permission_classes([IsAuthenticated])
@api_view(["GET"])
def get_user_shopping_list_quantity_bom_item_agnostic(request, component_pk, module_pk):
    shopping_list_item = UserShoppingList.objects.filter(
        component__id=component_pk,
        module__id=module_pk,
        user=request.user,
    )

    # Check if inventory exists
    if shopping_list_item.exists():
        # Access the first inventory object in the QuerySet
        # and retrieve the 'quantity' attribute
        quantity = shopping_list_item.first().quantity
        return Response({"quantity": quantity}, status=status.HTTP_200_OK)
    else:
        return Response({"quantity": 0}, status=status.HTTP_200_OK)


@permission_classes([IsAuthenticated])
@api_view(["GET"])
def get_user_shopping_list_quantity(
    request, component_pk, modulebomlistitem_pk, module_pk
):
    shopping_list_item = UserShoppingList.objects.filter(
        component__id=component_pk,
        module__id=module_pk,
        bom_item__id=modulebomlistitem_pk,
        user=request.user,
    )

    # Check if inventory exists
    if shopping_list_item.exists():
        # Access the first inventory object in the QuerySet
        # and retrieve the 'quantity' attribute
        quantity = shopping_list_item.first().quantity
        return Response({"quantity": quantity}, status=status.HTTP_200_OK)
    else:
        return Response({"quantity": 0}, status=status.HTTP_200_OK)


@permission_classes([IsAuthenticated])
@api_view(["GET"])
def get_user_anonymous_shopping_list_quantity(request, component_pk):
    aggregate = request.query_params.get("aggregate", True)

    if aggregate:
        shopping_list_items = UserShoppingList.objects.filter(
            component__id=component_pk,
            user=request.user,
        )

        if shopping_list_items.exists():
            quantity = shopping_list_items.aggregate(Sum("quantity"))["quantity__sum"]
            return Response({"quantity": quantity}, status=status.HTTP_200_OK)
        else:
            return Response({"quantity": 0}, status=status.HTTP_200_OK)
    else:
        shopping_list_item = (
            UserShoppingList.objects.filter(
                component__id=component_pk,
                user=request.user,
            )
            .exclude(module__isnull=False)
            .exclude(bom_item__isnull=False)
        )

        # Check if inventory exists
        if shopping_list_item.exists():
            # Access the first inventory object in the QuerySet
            # and retrieve the 'quantity' attribute
            quantity = shopping_list_item.first().quantity
            return Response({"quantity": quantity}, status=status.HTTP_200_OK)
        else:
            return Response({"quantity": 0}, status=status.HTTP_200_OK)


@permission_classes([IsAuthenticated])
@api_view(["POST"])
def user_anonymous_shopping_list_create_or_update(request, component_pk):
    """
    Endpoint for creating or updating an anonymous item in the user's shopping list.
    'Anonymous' refers to items without a module and bom_item.
    If an anonymous shopping list item with the provided component_pk exists, the quantity of the item is updated based on the 'editMode':
    - If 'editMode' is True or not provided, the quantity is set to the value provided in 'quantity'.
    - If 'editMode' is False, the provided 'quantity' is added to the current quantity of the item.
    If no anonymous shopping list item with the provided component_pk exists, a new item is created with the provided 'quantity'.
    """

    user = request.user
    quantity = int(request.data.get("quantity", 0))
    # Determine the editing mode from request
    edit_mode = request.data.get("editMode", True)

    try:
        component = Component.objects.get(pk=component_pk)
    except Component.DoesNotExist:
        return Response(
            {"detail": "Component not found."}, status=status.HTTP_404_NOT_FOUND
        )

    shopping_list_item = (
        UserShoppingList.objects.filter(user=user, component=component)
        .exclude(module__isnull=False)
        .exclude(bom_item__isnull=False)
        .first()
    )
    if shopping_list_item is not None:
        if edit_mode:
            shopping_list_item.quantity = quantity
        else:
            shopping_list_item.quantity += quantity
        shopping_list_item.save()
    else:
        shopping_list_item = UserShoppingList.objects.create(
            user=user, component=component, quantity=quantity
        )

    serializer = UserShoppingListSerializer(shopping_list_item)
    return Response(serializer.data, status=status.HTTP_200_OK)


@permission_classes([IsAuthenticated])
@api_view(["POST"])
def user_shopping_list_create_or_update(request, component_pk):
    """
    Endpoint for creating or updating an item in the user's shopping list.
    If a shopping list item with the provided component_pk, module_pk, and modulebomlistitem_pk exists,
    the quantity of the item is updated based on the 'editMode':
    - If 'editMode' is True or not provided, the quantity is set to the value provided in 'quantity'.
    - If 'editMode' is False, the provided 'quantity' is added to the current quantity of the item.
    If no shopping list item with the provided parameters exists, a new item is created with the provided 'quantity'.
    """

    user = request.user
    quantity = int(request.data.get("quantity", 0))
    module_bom_list_item_pk = int(request.data.get("modulebomlistitem_pk", None))
    module_pk = int(request.data.get("module_pk", None))

    # Determine the editing mode from request
    edit_mode = request.data.get("editMode", True)

    try:
        component = Component.objects.get(pk=component_pk)
    except Component.DoesNotExist:
        return Response(
            {"detail": "Component not found."}, status=status.HTTP_404_NOT_FOUND
        )

    try:
        module_obj = Module.objects.get(pk=module_pk)
    except Module.DoesNotExist:
        return Response(
            {"detail": "Module not found."}, status=status.HTTP_404_NOT_FOUND
        )

    try:
        module_bom_list_item = ModuleBomListItem.objects.get(pk=module_bom_list_item_pk)
    except ModuleBomListItem.DoesNotExist:
        return Response(
            {"detail": "Module BOM list item not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    shopping_list_item, created = UserShoppingList.objects.get_or_create(
        user=user,
        component=component,
        bom_item=module_bom_list_item,
        module=module_obj,
        defaults={"quantity": quantity},
    )

    if not created:
        if edit_mode:
            shopping_list_item.quantity = quantity
        else:
            shopping_list_item.quantity += quantity
        shopping_list_item.save()

    serializer = UserShoppingListSerializer(shopping_list_item)
    status_code = status.HTTP_201_CREATED if created else status.HTTP_200_OK
    return Response(serializer.data, status=status_code)


@permission_classes([IsAuthenticated])
@api_view(["PATCH"])
def user_shopping_list_update(request, component_pk):
    """
    Endpoint for updating the quantity of an item in the user's shopping list.

    The request should include a 'quantity' that is greater than zero.
    If 'quantity' is not provided or is less than or equal to zero, a 400 BAD REQUEST response is returned.

    The endpoint also takes an optional 'modulebomlistitem_pk' and 'module_pk'.
    - If these values are not provided, the endpoint will look for an anonymous item (an item without a module or bom_item) in the shopping list.
    - If these values are provided, the endpoint will look for a specific item that matches the provided parameters.

    If the shopping list item exists, its quantity is updated to the provided 'quantity' and a 200 OK response with the serialized shopping list item is returned.
    If the shopping list item does not exist, a 404 NOT FOUND response is returned.
    """

    user = request.user
    quantity = int(request.data.get("quantity", 0))

    if quantity <= 0:
        return Response(
            {"detail": "Quantity must be greater than zero."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    module_bom_list_item_pk = request.data.get("modulebomlistitem_pk", None)

    if module_bom_list_item_pk is not None:
        module_bom_list_item_pk = int(module_bom_list_item_pk)

    module_pk = request.data.get("module_pk", None)

    if module_pk is not None:
        module_pk = int(module_pk)

    print(module_bom_list_item_pk)
    print(module_pk)

    if not module_bom_list_item_pk or not module_pk:
        shopping_list_item = (
            UserShoppingList.objects.filter(
                component__id=component_pk,
                user=user,
            )
            .exclude(module__isnull=False)
            .exclude(bom_item__isnull=False)
        ).first()
        print("anon", shopping_list_item)
    else:
        shopping_list_item = (
            UserShoppingList.objects.filter(
                user=user,
                component__id=component_pk,
                bom_item__id=module_bom_list_item_pk,
                module__id=module_pk,
            )
            .exclude(module__isnull=True)
            .exclude(bom_item__isnull=True)
            .first()
        )
        print("module", shopping_list_item)

    if not shopping_list_item:
        return Response(
            {"detail": "Shopping list item not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    shopping_list_item.quantity = quantity
    shopping_list_item.save()

    serializer = UserShoppingListSerializer(shopping_list_item)

    return Response(serializer.data)


@permission_classes([IsAuthenticated])
@api_view(["DELETE"])
def user_shopping_list_delete_module(request, module_pk):
    user = request.user
    shopping_list_item = UserShoppingList.objects.filter(
        user=user, module__id=module_pk
    )

    if not shopping_list_item:
        return Response(
            {"detail": "Shopping list item not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    shopping_list_item.delete()
    return Response(
        {"detail": "Shopping list item deleted successfully"},
        status=status.HTTP_204_NO_CONTENT,
    )


@permission_classes([IsAuthenticated])
@api_view(["GET"])
def get_user_inventory_quantities_for_bom_list_item(request, modulebomlistitem_pk):
    """
    Get sum of components in user inventory that fulfill a given bom list item
    """
    bom_list_item = ModuleBomListItem.objects.get(id=modulebomlistitem_pk)
    inventory = UserInventory.objects.filter(
        component__in=bom_list_item.components_options.all(), user=request.user
    )

    # Check if inventory exists
    if inventory.exists():
        # Use aggregate function to get the sum of 'quantity' attribute
        quantity_sum = inventory.aggregate(Sum("quantity")).get("quantity__sum")
        return Response({"quantity": quantity_sum}, status=status.HTTP_200_OK)
    else:
        return Response({"quantity": 0}, status=status.HTTP_200_OK)


@api_view(["GET"])
def get_module_bom_list_items(request, module_pk):
    try:
        # Retrieve the Module instance based on the provided module_pk
        module = Module.objects.get(pk=module_pk)
    except Module.DoesNotExist:
        # Return a response indicating that the module does not exist
        return Response(
            {"error": "Module does not exist"}, status=status.HTTP_404_NOT_FOUND
        )

    # Filter ModuleBomListItem instances based on the retrieved module
    module_bom_list_items = ModuleBomListItem.objects.filter(module=module)

    if request.user.is_authenticated:
        # Use aggregation to sum quantities of UserInventory instances for each component in the queryset
        module_bom_list_items = module_bom_list_items.annotate(
            sum_of_user_options_from_inventory=Sum(
                "components_options__userinventory__quantity",
                filter=Q(components_options__userinventory__user=request.user),
                distinct=True,
            )
        )

    # Serialize the retrieved ModuleBomListItem instances
    serializer = ModuleBomListItemSerializer(module_bom_list_items, many=True)

    # Return the serialized data as a response
    return Response(serializer.data)


class ComponentView(APIView):
    def get(self, request):
        # Get the page number and search query from the request query parameters
        page_number = request.query_params.get("page", 1)
        search_query = request.query_params.get("search", "")

        # Retrieve filter parameters from the request's query parameters
        ohms_filter = request.query_params.get("ohms", None)
        farads_filter = request.query_params.get("farads", None)
        voltage_rating_filter = request.query_params.get("voltage_rating", None)
        tolerance_filter = request.query_params.get("tolerance", None)
        mounting_style_filter = request.query_params.get("mounting_style", None)
        manufacturer_filter = request.query_params.get("manufacturer", None)
        supplier_filter = request.query_params.get("supplier", None)
        type_filter = request.query_params.get("type", None)

        # Start with a base queryset
        components = Component.objects.select_related("manufacturer", "supplier").all()

        # Apply search query filter if present
        if search_query:
            components = components.filter(
                Q(description__icontains=search_query)
                | Q(manufacturer__name__icontains=search_query)
                | Q(supplier__name__icontains=search_query)
                | Q(supplier_item_no__icontains=search_query)
                | Q(type__name__icontains=search_query)
                | Q(ohms__icontains=search_query)
                | Q(farads__icontains=search_query)
                | Q(voltage_rating__icontains=search_query)
                | Q(tolerance__icontains=search_query)
                | Q(notes__icontains=search_query)
            )

        # Apply additional filters if present
        if ohms_filter:
            components = components.filter(ohms__icontains=ohms_filter)
        if farads_filter:
            components = components.filter(farads__icontains=farads_filter)
        if voltage_rating_filter:
            components = components.filter(
                voltage_rating__icontains=voltage_rating_filter
            )
        if tolerance_filter:
            components = components.filter(tolerance__icontains=tolerance_filter)
        if mounting_style_filter:
            components = components.filter(
                mounting_style__icontains=mounting_style_filter
            )
        if manufacturer_filter:
            components = components.filter(manufacturer__pk=int(manufacturer_filter))
        if supplier_filter:
            components = components.filter(supplier__pk=int(supplier_filter))
        if type_filter:
            components = components.filter(type__name__icontains=type_filter)

        # Sort by description after applying all filters
        components = components.order_by("description")

        # Create a paginator instance
        paginator = Paginator(components, 10)

        # Retrieve the page based on the page number
        page = paginator.get_page(page_number)

        # Serialize the retrieved Component instances
        serializer = ComponentSerializer(page, many=True)

        # Get unique values
        unique_ohms = Component.get_unique_ohms_or_farads_values("ohms", "ohms_unit")
        unique_farads = Component.get_unique_ohms_or_farads_values(
            "farads", "farads_unit"
        )
        unique_voltage_ratings = Component.get_unique_values("voltage_rating", str)
        unique_tolerances = Component.get_unique_values("tolerance", str)
        unique_mounting_style = Component.get_mounting_styles()

        # Get unique manufacturer, supplier, and type names
        unique_manufacturers = list(
            ComponentManufacturer.objects.values("name", "pk")
            .distinct()
            .order_by("name")
        )
        unique_suppliers = list(
            ComponentSupplier.objects.values("name", "pk").distinct().order_by("name")
        )

        unique_manufacturers = [
            {"label": manufacturer["name"], "value": manufacturer["pk"]}
            for manufacturer in unique_manufacturers
        ]
        unique_suppliers = [
            {"label": supplier["name"], "value": supplier["pk"]}
            for supplier in unique_suppliers
        ]

        unique_types = list(
            Types.objects.values_list("name", flat=True).distinct().order_by("name")
        )

        # Prepare the response data
        response_data = {
            "count": paginator.count,
            "next": page.next_page_number() if page.has_next() else None,
            "previous": page.previous_page_number() if page.has_previous() else None,
            "results": serializer.data,
            "unique_values": {
                "ohms": unique_ohms,
                "farads": unique_farads,
                "voltage_rating": unique_voltage_ratings,
                "tolerance": unique_tolerances,
                "mounting_style": unique_mounting_style,
                "manufacturer": unique_manufacturers,
                "supplier": unique_suppliers,
                "type": unique_types,
            },
        }

        return Response(response_data)


@api_view(["GET"])
def get_components_by_ids(request, pks):
    # Validate input
    if not pks:
        return Response(
            {"error": "No component pks provided"}, status=status.HTTP_400_BAD_REQUEST
        )

    # Split the pks string into a list of integers
    component_pks = list(map(int, pks.split(",")))

    # Retrieve the Component instances based on the provided component_pks
    components = Component.objects.filter(pk__in=component_pks)

    # Check if components are found
    if not components:
        return Response(
            {"error": "Components do not exist"}, status=status.HTTP_404_NOT_FOUND
        )

    # Serialize and return the components
    serializer = ComponentSerializer(components, many=True)
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_all_user_shopping_list_to_inventory(request):
    try:
        # Get the authenticated user
        user = request.user

        # Get all shopping list items for the user
        shopping_list_items = UserShoppingList.objects.filter(user=user)

        if not shopping_list_items.exists():
            return Response({"error": "No items in shopping list."}, status=404)

        for item in shopping_list_items:
            # Retrieve the inventory item or create a new one if it does not exist
            inventory_item, created = UserInventory.objects.get_or_create(
                user=user,
                component=item.component,
                defaults={"quantity": item.quantity, "location": item.location},
            )

            # If the item already existed in the inventory, add the quantity of the shopping list item to it
            if not created:
                inventory_item.quantity = F("quantity") + item.quantity
                inventory_item.save()

        # Get the updated inventory for the user
        updated_inventory = UserInventory.objects.filter(user=user)

        # Serialize the inventory items to JSON
        serializer = UserInventorySerializer(updated_inventory, many=True)

        return Response(serializer.data)

    except CustomUser.DoesNotExist:
        return Response({"error": "User not found."}, status=404)
