from components.models import Component, ComponentManufacturer, ComponentSupplier, Types
from components.serializers import ComponentSerializer
from django.core.paginator import Paginator
from django.contrib.postgres.search import TrigramSimilarity
from django.db.models import Q
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import ValidationError
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
        components = Component.objects.select_related("manufacturer", "supplier").all()

        # Apply TrigramSimilarity search if present
        if search_query:
            components = (
                components.annotate(
                    similarity=TrigramSimilarity("description", search_query)
                    + TrigramSimilarity("manufacturer__name", search_query)
                    + TrigramSimilarity("supplier__name", search_query)
                    + TrigramSimilarity("type__name", search_query)
                )
                .filter(similarity__gt=0.3)
                .order_by("-similarity")
            )

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
            components = components.filter(supplier__pk=UUID(filters["supplier"]))
        if "type" in filters:
            components = components.filter(type__name__icontains=filters["type"])

        # Sort by description after applying all filters
        components = components.order_by("description")

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
