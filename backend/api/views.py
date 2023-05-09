from shopping_list.serializers import UserShoppingListSerializer
from shopping_list.models import UserShoppingList
from components.serializers import ComponentSerializer
from components.models import Component
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
from modules.serializers import (
    ModuleSerializer,
    BuiltModuleSerializer,
    WantTooBuildModuleSerializer,
)
from modules.models import BuiltModules, WantToBuildModules
from rest_framework import status
from inventory.models import UserInventory
from inventory.serializers import UserInventorySerializer
from modules.serializers import ModuleBomListItemSerializer
from django.db.models import Sum, Q
from accounts.serializers import UserSerializer, UserHistorySerializer


@api_view(["GET"])
@login_required
def get_user_me(request):
    user = request.user
    serializer = UserSerializer(user)
    return Response(serializer.data)


@api_view(["GET"])
@login_required
def get_user_history(request):
    user = request.user
    serializer = UserHistorySerializer(user)
    return Response(serializer.data)


@api_view(["DELETE"])
@login_required
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


@api_view(["GET"])
@login_required
def get_built_modules(request):
    # Get all built modules for the current user
    built_modules = BuiltModules.objects.filter(user=request.user).order_by("-id")

    # Paginate the results
    paginator = Paginator(built_modules, 10)  # Show 10 built modules per page
    page = request.GET.get("page")
    built_modules_page = paginator.get_page(page)

    # Serialize the results and return them in the response
    serializer = BuiltModuleSerializer(built_modules_page, many=True)
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


@api_view(["GET"])
@login_required
def get_wtb_modules(request):
    # Get all built modules for the current user
    built_modules = WantToBuildModules.objects.filter(user=request.user).order_by("-id")

    # Paginate the results
    paginator = Paginator(built_modules, 10)  # Show 10 built modules per page
    page = request.GET.get("page")
    built_modules_page = paginator.get_page(page)

    # Serialize the results and return them in the response
    serializer = WantTooBuildModuleSerializer(built_modules_page, many=True)
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


@login_required
@api_view(["GET"])
def get_user_inventory(request):
    """
    Retrieve the user's own inventory.
    """
    user = request.user
    inventory = UserInventory.objects.filter(user=user)
    serializer = UserInventorySerializer(inventory, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["POST"])
def user_inventory_quantity_add_or_create(request, component_pk):
    user = request.user

    # Check if the user inventory item exists
    try:
        user_inventory_item = UserInventory.objects.get(
            user=user, component_id=component_pk
        )
    except UserInventory.DoesNotExist:
        user_inventory_item = None

    # If the user inventory item exists, update the quantity
    if user_inventory_item is not None:
        user_inventory_item.quantity += int(request.data.get("quantity", 0))
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


@login_required
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


@login_required
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


@login_required
@api_view(["GET"])
def get_user_shopping_list(request):
    """
    Retrieve the user's own shooping list grouped by module.
    """
    user = request.user
    inventory = UserShoppingList.objects.filter(user=user).order_by("module__name")
    serializer = UserShoppingListSerializer(inventory, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@login_required
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


@login_required
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


@login_required
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


@login_required
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


@login_required
@api_view(["POST"])
def user_anonymous_shopping_list_add_or_update(request, component_pk):
    user = request.user
    quantity = int(request.data.get("quantity", 0))
    try:
        component = Component.objects.get(pk=component_pk)
        print(component)
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
        shopping_list_item.quantity += quantity
        shopping_list_item.save()
    else:
        shopping_list_item = UserShoppingList.objects.create(
            user=user, component=component, quantity=quantity
        )

    serializer = UserShoppingListSerializer(shopping_list_item)
    return Response(serializer.data, status=status.HTTP_200_OK)


@login_required
@api_view(["POST"])
def user_shopping_list_add_or_update(request, component_pk):
    user = request.user
    quantity = int(request.data.get("quantity", 0))
    module_bom_list_item_pk = int(request.data.get("modulebomlistitem_pk", None))
    module_pk = int(request.data.get("module_pk", None))

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
        shopping_list_item.quantity += quantity
        shopping_list_item.save()

    serializer = UserShoppingListSerializer(shopping_list_item)
    status_code = status.HTTP_201_CREATED if created else status.HTTP_200_OK
    return Response(serializer.data, status=status_code)


@login_required
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


@api_view(["GET"])
def get_components(request):
    # Get the page number from the request query parameters
    page_number = request.query_params.get("page", 1)

    # Retrieve only the id and name fields of the Component instances from the database
    components = Component.objects.all()

    # Create a paginator instance
    paginator = Paginator(components, 10)

    # Retrieve the page based on the page number
    page = paginator.page(page_number)

    # Serialize the retrieved Component instances
    serializer = ComponentSerializer(page, many=True)

    # Return the serialized data as a response
    return Response(serializer.data)


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
