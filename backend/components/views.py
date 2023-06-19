from components.models import Component, ComponentManufacturer, ComponentSupplier, Types
from components.serializers import ComponentSerializer
from django.core.paginator import Paginator
from django.db.models import Q, Sum
from modules.models import Module, ModuleBomListItem
from modules.serializers import ModuleBomListItemSerializer
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView


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
