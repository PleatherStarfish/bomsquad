from components.models import (
    Component,
    ComponentManufacturer,
    ComponentSupplier,
    Types,
    ComponentManufacturer,
    ComponentSupplier,
    Category,
    SizeStandard,
    ComponentSupplierItem,
)
from components.serializers import (
    ComponentSerializer,
    CreateComponentSerializer,
    CreateComponentSupplierItemSerializer,
)
from inventory.models import UserInventory
from django.views.decorators.cache import cache_page
from django.http import JsonResponse
from django.db import transaction

from django.core.paginator import Paginator
from django.contrib.postgres.search import TrigramSimilarity
from django.db.models import Q, FloatField, Value
from django.contrib.auth.decorators import login_required
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from components.models import FARAD_UNITS, OHMS_UNITS
from uuid import UUID
import re
import json


def validate_numeric_with_unit(value, valid_units):

    # Regex to match numeric value and unit
    match = re.match(r"([\d.]+)\s*([^\d\s]+)", value)
    if not match:
        raise ValidationError("Invalid format. Use 'value unit' (e.g., '1.0 kΩ').")

    value, unit = match.groups()
    if unit not in valid_units:
        raise ValidationError(
            f"Invalid unit '{unit}'. Valid units: {', '.join(valid_units)}."
        )

    return float(value), unit


def extract_uuids(pks):
    """
    Extract UUIDs from a comma-separated string.
    """
    try:
        return [UUID(uid) for uid in pks.split(",")]
    except:
        raise ValueError("Invalid UUIDs provided.")


class ComponentView(APIView):
    def get(self, request):
        # Get the page number and search query from the request query parameters
        page_number = request.query_params.get("page", 1)
        search_query = request.query_params.get("search", "")

        # Build the filters dictionary from query parameters
        filters = {
            "ohms": request.query_params.get("ohms"),
            "farads": request.query_params.get("farads"),
            "voltage_rating": request.query_params.get("voltage_rating"),
            "tolerance": request.query_params.get("tolerance"),
            "mounting_style": request.query_params.get("mounting_style"),
            "manufacturer": request.query_params.get("manufacturer"),
            "supplier": request.query_params.get("supplier"),
            "type": request.query_params.get("type"),
        }

        # Remove any keys with `None` values
        filters = {key: value for key, value in filters.items() if value is not None}

        # Start with a base queryset
        components = (
            Component.objects.select_related("manufacturer", "type")
            .prefetch_related("supplier_items", "supplier_items__supplier")
            .all()
        )

        # Apply TrigramSimilarity search if present
        if search_query:
            trigram_components = components.annotate(
                similarity=TrigramSimilarity("description", search_query)
                + TrigramSimilarity("manufacturer__name", search_query)
                + TrigramSimilarity("manufacturer_part_no", search_query)
                + TrigramSimilarity("supplier_items__supplier__name", search_query)
                + TrigramSimilarity("supplier_items__supplier_item_no", search_query)
                + TrigramSimilarity("type__name", search_query)
            ).filter(similarity__gt=0.4)

            ilike_components = components.filter(
                Q(description__icontains=search_query)
                | Q(manufacturer__name__icontains=search_query)
                | Q(manufacturer_part_no__icontains=search_query)
                | Q(supplier_items__supplier__name__icontains=search_query)
                | Q(supplier_items__supplier_item_no__icontains=search_query)
                | Q(type__name__icontains=search_query)
            ).annotate(similarity=Value(0.0, output_field=FloatField()))

            # Combine the QuerySets
            components = (trigram_components | ilike_components).distinct()

            # Sort components by similarity in descending order
            components = components.order_by("-similarity")

        # Dynamically apply filters
        try:
            if "ohms" in filters:
                value, unit = validate_numeric_with_unit(
                    filters["ohms"], dict(OHMS_UNITS).keys()
                )
                components = components.filter(ohms=value, ohms_unit=unit)

            if "farads" in filters:
                value, unit = validate_numeric_with_unit(
                    filters["farads"], dict(FARAD_UNITS).keys()
                )
                components = components.filter(farads=value, farads_unit=unit)

        except ValidationError as e:
            return Response({"error": str(e)}, status=400)

        if "voltage_rating" in filters:
            components = components.filter(
                voltage_rating__icontains=filters["voltage_rating"]
            )
        if "tolerance" in filters:
            components = components.filter(tolerance__icontains=filters["tolerance"])
        if "mounting_style" in filters:
            components = components.filter(
                mounting_style__icontains=filters["mounting_style"]
            )
        if "manufacturer" in filters:
            components = components.filter(
                manufacturer__pk=UUID(filters["manufacturer"])
            )
        if "supplier" in filters:
            components = components.filter(
                supplier_items__supplier__pk=UUID(filters["supplier"])
            )
        if "type" in filters:
            components = components.filter(type__name__icontains=filters["type"])

        # Create a paginator instance
        paginator = Paginator(components, 30)

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
            {"label": manufacturer["name"], "value": str(manufacturer["pk"])}
            for manufacturer in unique_manufacturers
        ]
        unique_suppliers = [
            {"label": supplier["name"], "value": str(supplier["pk"])}
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
    if not pks:
        return Response(
            {"error": "No component pks provided"}, status=status.HTTP_400_BAD_REQUEST
        )

    try:
        component_pks = extract_uuids(pks)
    except ValueError:
        return Response(
            {"error": "Invalid UUID format provided"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    components = Component.objects.filter(pk__in=component_pks)

    if not components.exists():
        return Response(
            {"error": "Components do not exist"}, status=status.HTTP_404_NOT_FOUND
        )

    serializer = ComponentSerializer(components, many=True)
    return Response(serializer.data)


@cache_page(60 * 60)
@login_required
@api_view(["GET"])
def get_component_dropdowns(request):
    try:
        types = list(Types.objects.values("id", "name"))
        manufacturers = list(ComponentManufacturer.objects.values("id", "name"))
        suppliers = list(ComponentSupplier.objects.values("id", "name"))
        categories = list(Category.objects.values("id", "name"))
        sizes = list(SizeStandard.objects.values("id", "name"))
        return JsonResponse(
            {
                "types": types,
                "manufacturers": manufacturers,
                "suppliers": suppliers,
                "categories": categories,
                "sizes": sizes,
            }
        )
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


# tests
@login_required
@api_view(["POST"])
def create_component(request):
    component_data = request.data.get("component", {})
    supplier_items_data = request.data.get("supplier_items", [])
    quantity = request.data.get("quantity")  # Optional quantity parameter

    # Ensure voltage_rating has a default value
    component_data["voltage_rating"] = component_data.get("voltage_rating") or ""

    # Validate quantity upfront
    if quantity is not None:
        try:
            quantity = int(quantity)
            if quantity <= 0:
                return Response(
                    {
                        "fieldErrors": {
                            "quantity": "Quantity must be greater than zero."
                        },
                        "message": "Invalid quantity value.",
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
        except ValueError:
            return Response(
                {
                    "fieldErrors": {"quantity": "Quantity must be an integer."},
                    "message": "Invalid quantity value.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

    # Validate supplier items before saving component
    supplier_item_errors = []
    seen_supplier_items = set()
    for supplier_item_data in supplier_items_data:
        supplier = supplier_item_data.get("supplier")
        supplier_item_no = supplier_item_data.get("supplier_item_no")
        price = supplier_item_data.get("price")
        pcs = supplier_item_data.get("pcs")

        # Validate required fields
        if not supplier or not supplier_item_no or price is None or pcs is None:
            supplier_item_errors.append(
                {
                    "supplier_item_no": f"Missing required fields for supplier item with supplier '{supplier}' and item number '{supplier_item_no}'."
                }
            )
            continue

        # Check for duplicates in the current request
        supplier_item_key = (supplier, supplier_item_no)
        if supplier_item_key in seen_supplier_items:
            supplier_item_errors.append(
                {
                    "supplier_item_no": f"Duplicate supplier item number '{supplier_item_no}' for supplier '{supplier}' in the request."
                }
            )
            continue

        seen_supplier_items.add(supplier_item_key)

    # If supplier items are invalid, return error response before saving the component
    if supplier_item_errors:
        return Response(
            {
                "fieldErrors": {"supplier_item_errors": supplier_item_errors},
                "message": "Failed to submit supplier items.",
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        with transaction.atomic():
            # Validate and save the component
            component_serializer = CreateComponentSerializer(
                data=component_data, context={"request": request}
            )
            if not component_serializer.is_valid():
                return Response(
                    {
                        "fieldErrors": {
                            "component_errors": component_serializer.errors
                        },
                        "message": "Failed to submit component.",
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
            component = component_serializer.save(
                submitted_by=request.user,
                user_submitted_status="pending",
            )

            # Track supplier item errors
            supplier_item_errors = []
            seen_supplier_items = set()
            validated_supplier_items = []

            # Validate supplier items
            for supplier_item_data in supplier_items_data:
                # Extract supplier item fields
                item_data = supplier_item_data.copy()
                supplier = item_data.get("supplier")
                supplier_item_no = item_data.get("supplier_item_no")
                price = item_data.get("price")
                pcs = item_data.get("pcs")

                # Validate required fields
                if not supplier or not supplier_item_no or price is None or pcs is None:
                    supplier_item_errors.append(
                        {
                            "supplier_item_no": f"Missing required fields for supplier item with supplier '{supplier}' and item number '{supplier_item_no}'."
                        }
                    )
                    continue

                supplier_item_key = (supplier, supplier_item_no)

                # Check for duplicates in the request
                if supplier_item_key in seen_supplier_items:
                    supplier_item_errors.append(
                        {
                            "supplier_item_no": f"Duplicate supplier item number '{supplier_item_no}' for supplier '{supplier}' in the request."
                        }
                    )
                    continue

                seen_supplier_items.add(supplier_item_key)

                # Check if the supplier item already exists in the database
                existing_supplier_item = ComponentSupplierItem.objects.filter(
                    supplier=supplier, supplier_item_no=supplier_item_no
                ).first()

                if existing_supplier_item:
                    # Add the existing item to the list for linking later
                    validated_supplier_items.append(existing_supplier_item)
                else:
                    # Prepare data for creating a new supplier item
                    item_data["component"] = component.id
                    item_data["submitted_by"] = request.user.id
                    item_data["user_submitted_status"] = "pending"

                    supplier_item_serializer = CreateComponentSupplierItemSerializer(
                        data=item_data
                    )
                    if supplier_item_serializer.is_valid():
                        validated_supplier_items.append(
                            supplier_item_serializer.validated_data
                        )
                    else:
                        supplier_item_errors.append(
                            {
                                "supplier_item_no": supplier_item_serializer.errors.get(
                                    "supplier_item_no", "Invalid supplier item number."
                                )
                            }
                        )

            # If there are supplier item errors, do not proceed
            if supplier_item_errors:
                return Response(
                    {
                        "fieldErrors": {"supplier_item_errors": supplier_item_errors},
                        "message": "Failed to submit supplier items.",
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Save validated supplier items
            for item in validated_supplier_items:
                if isinstance(item, ComponentSupplierItem):
                    # Link existing item to the new component
                    item.component = component
                    item.save()
                else:
                    # Create a new supplier item
                    ComponentSupplierItem.objects.create(**item)

            # If quantity is provided, add the component to the user's inventory
            if quantity is not None:
                UserInventory.objects.create(
                    user=request.user,
                    component=component,
                    quantity=quantity,
                )

    except Exception as e:
        return Response(
            {"error": f"Transaction failed due to an error: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return Response(
        {
            "message": "Component and supplier items created successfully.",
            "component": component_serializer.data,
        },
        status=status.HTTP_201_CREATED,
    )
