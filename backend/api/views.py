from shopping_list.serializers import UserShoppingListSerializer
from shopping_list.models import UserShoppingList
from modules.serializers import ComponentSerializer
from components.models import Component
from rest_framework import generics
from django.shortcuts import get_object_or_404
from modules.models import Module, ModuleBomListItem
from api.serializers import ModuleSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.decorators import login_required
from django.middleware import csrf
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.core.paginator import Paginator
from modules.serializers import BuiltModuleSerializer, WantTooBuildModuleSerializer
from modules.models import BuiltModules, WantToBuildModules
from rest_framework import status
from inventory.models import UserInventory
from .serializers import UserInventorySerializer
from modules.serializers import ModuleBomListItemSerializer
from django.db.models import Sum, Q


@api_view(["GET"])
@permission_classes([IsAuthenticated])
@login_required
def get_user_me(request):
    user = request.user
    data = {
        "id": user.id,
        "username": user.username,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
    }
    response = Response(data)
    response["Access-Control-Allow-Origin"] = "http://localhost:3000"
    response["Access-Control-Allow-Methods"] = "GET"
    response["Access-Control-Allow-Headers"] = "Content-Type, X-CSRFToken"
    response["Access-Control-Allow-Credentials"] = "true"
    csrf.get_token(request)
    return response


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
@permission_classes([IsAuthenticated])
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

    response = Response(data)
    response["Access-Control-Allow-Origin"] = "http://localhost:3000"
    response["Access-Control-Allow-Methods"] = "GET"
    response["Access-Control-Allow-Headers"] = "Content-Type, X-CSRFToken"
    response["Access-Control-Allow-Credentials"] = "true"
    csrf.get_token(request)
    return response


@api_view(["GET"])
@permission_classes([IsAuthenticated])
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

    response = Response(data)
    response["Access-Control-Allow-Origin"] = "http://localhost:3000"
    response["Access-Control-Allow-Methods"] = "GET"
    response["Access-Control-Allow-Headers"] = "Content-Type, X-CSRFToken"
    response["Access-Control-Allow-Credentials"] = "true"
    csrf.get_token(request)
    return response


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


@login_required
@api_view(["GET"])
def get_user_shopping_list(request):
    """
    Retrieve the user's own inventory.
    """
    user = request.user
    inventory = UserShoppingList.objects.filter(user=user).sort("module__name")
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
def get_components(request, pks):
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
