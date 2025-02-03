import logging
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from django.db.models import Prefetch, Q, Sum, Count, Exists, OuterRef, Avg, F
from django.template.loader import render_to_string
from django.http import JsonResponse
from django.core.cache import cache
from components.models import (
    Component,
    ComponentManufacturer,
    ComponentSupplier,
    ComponentSupplierItem,
    Types,
)
from itertools import zip_longest
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.cache import cache_page
from django.contrib.postgres.search import (
    SearchVector,
    SearchQuery,
    SearchRank,
    TrigramSimilarity,
)
from uuid import UUID
from django.db import transaction

from django.shortcuts import get_object_or_404, redirect, render
from modules.models import (
    BuiltModules,
    Manufacturer,
    Module,
    SuggestedComponentForBomListItem,
    WantToBuildModules,
    ModuleBomListItem,
    ModuleBomListComponentForItemRating,
)
from modules.serializers import (
    BuiltModuleSerializer,
    ModuleSerializer,
    SuggestedComponentDetailSerializer,
    WantTooBuildModuleSerializer,
    ModuleBomListItemSerializer,
    ModuleBomListComponentForItemRatingSerializer,
    ModuleManufacturerSerializer,
    SuggestedComponentForBomListItemSerializer,
)
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

import hashlib

logger = logging.getLogger(__name__)


CACHE_TIMEOUT = 60 * 60  # 1 hour (60 seconds * 60 minutes)


def generate_color_from_name(name):
    # Generate a SHA256 hash of the name
    hash_object = hashlib.sha256(name.encode())
    hex_dig = hash_object.hexdigest()

    # Use the first 6 characters of the hash to generate RGB values
    r = int(hex_dig[0:2], 16)
    g = int(hex_dig[2:4], 16)
    b = int(hex_dig[4:6], 16)

    return f"rgba({r}, {g}, {b}, 0.2)", f"rgba({r}, {g}, {b}, 1)"


mounting_style_options = [
    {"name": "Surface Mount (SMT)", "value": "smt"},
    {"name": "Through Hole", "value": "th"},
]


def module_list(request):
    query = request.GET.get("search", "")
    manufacturer = request.GET.get("manufacturer", None)
    component_type = request.GET.get("component_type", None)
    category = request.GET.get("category", None)
    rack_unit = request.GET.get("rack_unit", None)
    user = request.user if request.user.is_authenticated else None

    # Retrieve lists of component filter criteria
    components = request.GET.getlist("component[]")
    component_ids = request.GET.getlist("component_id[]")
    quantity_mins = request.GET.getlist("quantity_min[]")
    quantity_maxs = request.GET.getlist("quantity_max[]")

    # Initialize module list with a base queryset
    module_list = Module.objects.order_by("-datetime_updated")

    # Apply individual component group filters with AND relationship
    for i in range(len(component_ids)):
        component_id = component_ids[i] if i < len(component_ids) else None
        quantity_min = quantity_mins[i] if i < len(quantity_mins) else None
        quantity_max = quantity_maxs[i] if i < len(quantity_maxs) else None

        # Build a filter for each component group
        bom_filter = Q()
        if component_id:
            bom_filter &= Q(modulebomlistitem__components_options__id=component_id)
        if quantity_min:
            bom_filter &= Q(modulebomlistitem__quantity__gte=quantity_min)
        if quantity_max:
            bom_filter &= Q(modulebomlistitem__quantity__lte=quantity_max)

        # Apply the filter to module_list
        module_list = module_list.filter(bom_filter)

    # Apply other filters
    if manufacturer:
        module_list = module_list.filter(manufacturer__name__icontains=manufacturer)
    if component_type:
        module_list = module_list.filter(mounting_style=component_type)
    if category:
        module_list = module_list.filter(category=category)
    if rack_unit:
        module_list = module_list.filter(rack_unit=rack_unit)
    if query:
        module_list = module_list.filter(
            Q(name__icontains=query)
            | Q(manufacturer__name__icontains=query)
            | Q(description__icontains=query)
        )

    # Annotate for user-specific data if the user is authenticated
    if user:
        module_list = module_list.annotate(
            is_built=Exists(
                BuiltModules.objects.filter(module=OuterRef("pk"), user=user)
            ),
            is_wtb=Exists(
                WantToBuildModules.objects.filter(module=OuterRef("pk"), user=user)
            ),
        )

    # Paginate the result
    paginator = Paginator(module_list, 10)
    page_number = request.GET.get("page")
    page_obj = paginator.get_page(page_number)

    # Prepare options for the filter dropdowns
    manufacturers = Manufacturer.objects.values("name").distinct()
    mounting_style_options = [
        {"name": "Surface Mount (SMT)", "value": "smt"},
        {"name": "Through Hole", "value": "th"},
    ]
    category_options = [
        {"name": choice[1], "value": choice[0]} for choice in Module.CATEGORY_CHOICES
    ]
    rack_unit_options = [
        {"name": choice[1], "value": choice[0]} for choice in Module.RACK_UNIT_CHOICES
    ]

    # Handle AJAX requests for infinite scroll
    if request.headers.get("x-requested-with") == "XMLHttpRequest":
        html = render_to_string(
            "modules/module_list_partial.html", {"page_obj": page_obj}
        )
        return JsonResponse({"html": html, "has_next": page_obj.has_next()})

    # Zip components with component criteria for displaying pills
    zipped_components = list(
        zip_longest(components, component_ids, quantity_mins, quantity_maxs)
    )

    # Render the main template
    return render(
        request,
        "modules/index.html",
        {
            "page_obj": page_obj,
            "manufacturers": manufacturers,
            "search": query,
            "manufacturer": manufacturer,
            "component_type": component_type,
            "category": category,
            "rack_unit": rack_unit,
            "user_logged_in": request.user.is_authenticated,
            "mounting_style_options": mounting_style_options,
            "category_options": category_options,
            "rack_unit_options": rack_unit_options,
            "zipped_components": zipped_components,
        },
    )


@login_required
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_module_to_built(request, module_id):
    if request.method == "POST":
        # Get the user from the request
        user = request.user

        # Check if the module already exists in the BuiltModules table
        built_module = BuiltModules.objects.filter(
            user=user, module__id=module_id
        ).first()
        if built_module:
            built_module.delete()
            messages.success(request, "Module removed from want-to-build modules")
        else:
            # Create a new BuiltModules object and save it to the database
            module = Module.objects.get(id=module_id)
            built_module = BuiltModules(user=user, module=module)
            built_module.save()
            messages.success(request, "Module added to want-to-build modules")
    else:
        messages.error(request, "Please log in to add a module")

    # Redirect back to the previous URL if available, otherwise redirect to "bomsquad:home"
    redirect_url = request.META.get("HTTP_REFERER") or "bomsquad:home"
    return redirect(redirect_url)


@login_required
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_module_to_wtb(request, module_id):
    if request.method == "POST":
        # Get the user from the request
        user = request.user

        # Check if the module already exists in the BuiltModules table
        built_module = WantToBuildModules.objects.filter(
            user=user, module__id=module_id
        ).first()
        if built_module:
            built_module.delete()
            messages.success(request, "Module removed from want-to-build modules")
        else:
            # Create a new BuiltModules object and save it to the database
            module = Module.objects.get(id=module_id)
            built_module = WantToBuildModules(user=user, module=module)
            built_module.save()
            messages.success(request, "Module added to want-to-build modules")
    else:
        messages.error(request, "Please log in to add a module")

    # Redirect back to the previous URL if available, otherwise redirect to "bomsquad:home"
    redirect_url = request.META.get("HTTP_REFERER") or "bomsquad:home"
    return redirect(redirect_url)


class UserModulesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, type):
        # Determine which type of modules to return
        if type == "built":
            modules = BuiltModules.objects.filter(user=request.user).order_by(
                "module__name"
            )
            serializer_class = BuiltModuleSerializer
        elif type == "want-to-build":
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
# @cache_page(CACHE_TIMEOUT)
def get_module_bom_list_items(request, module_pk):
    try:
        # Use select_related to reduce queries for related fields on Module
        module = Module.objects.select_related("manufacturer").get(pk=module_pk)
    except Module.DoesNotExist:
        return Response(
            {"error": "Module does not exist"}, status=status.HTTP_404_NOT_FOUND
        )

    # Prefetch related data for ModuleBomListItem and associated components and PCB versions
    module_bom_list_items = ModuleBomListItem.objects.filter(
        module=module
    ).prefetch_related(
        Prefetch(
            "components_options",
            queryset=Component.objects.select_related("type", "manufacturer"),
        ),
        "pcb_version",
    )

    # Annotate user-specific aggregations only if user is authenticated
    if request.user.is_authenticated:
        module_bom_list_items = module_bom_list_items.annotate(
            sum_of_user_options_from_inventory=Sum(
                "components_options__userinventory__quantity",
                filter=Q(components_options__userinventory__user=request.user),
            ),
            sum_of_user_options_from_shopping_list=Sum(
                "components_options__usershoppinglist__quantity",
                filter=Q(components_options__usershoppinglist__user=request.user),
            ),
        )

    # Serialize the data
    serializer = ModuleBomListItemSerializer(module_bom_list_items, many=True)

    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def rate_component(request):
    serializer = ModuleBomListComponentForItemRatingSerializer(data=request.data)
    if serializer.is_valid():
        rating_instance, created = (
            ModuleBomListComponentForItemRating.objects.update_or_create(
                user=request.user,
                module_bom_list_item_id=request.data["module_bom_list_item"],
                component_id=request.data["component"],
                defaults={"rating": request.data["rating"]},
            )
        )
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
def get_average_rating(request, module_bom_list_item_id, component_id):
    cache_key = f"average_rating_{module_bom_list_item_id}_{component_id}"

    # Try to retrieve the cached result first
    cached_data = cache.get(cache_key)
    if cached_data:
        return Response(cached_data, status=status.HTTP_200_OK)

    try:
        # Check if there are any ratings for this item and component
        ratings_exist = ModuleBomListComponentForItemRating.objects.filter(
            module_bom_list_item_id=module_bom_list_item_id, component_id=component_id
        ).exists()

        # If ratings exist, proceed with aggregation
        if ratings_exist:
            result = ModuleBomListComponentForItemRating.objects.filter(
                module_bom_list_item_id=module_bom_list_item_id,
                component_id=component_id,
            ).aggregate(average_rating=Avg("rating"), number_of_ratings=Count("rating"))

            # Round average rating to 2 decimal places
            average_rating = (
                round(result["average_rating"], 2) if result["average_rating"] else 0
            )
            response_data = {
                "average_rating": average_rating,
                "number_of_ratings": result["number_of_ratings"],
            }

            # Cache the response data
            cache.set(cache_key, response_data, timeout=CACHE_TIMEOUT)
            return Response(response_data, status=status.HTTP_200_OK)
        else:
            # If no ratings exist, return a 204 No Content response
            return Response(
                {"detail": "Not rated"},
                status=status.HTTP_204_NO_CONTENT,
            )
    except Exception as e:
        return Response(
            {"detail": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_module_status(request, module_pk):
    user = request.user
    module = get_object_or_404(Module, pk=module_pk)
    is_built = BuiltModules.objects.filter(user=user, module=module).exists()
    is_wtb = WantToBuildModules.objects.filter(user=user, module=module).exists()

    return Response({"is_built": is_built, "is_wtb": is_wtb}, status=status.HTTP_200_OK)


def manufacturer_detail(request, slug):
    cache_key = f"manufacturer_detail_{slug}"
    cached_data = cache.get(cache_key)

    if cached_data:
        context = cached_data
    else:
        manufacturer = get_object_or_404(Manufacturer, slug=slug)

        # Generate color for the main manufacturer
        main_color, main_border_color = generate_color_from_name(manufacturer.name)

        # Calculate the total number of modules for this manufacturer.
        total_modules = Module.objects.filter(manufacturer=manufacturer).count()

        # Get the component usage data for the main manufacturer and sort by count
        component_usage_count = (
            ModuleBomListItem.objects.filter(module__manufacturer=manufacturer)
            .values("components_options__description", "components_options__id")
            .annotate(count=Count("id"))
            .order_by("-count")
        )

        component_usage_quantity = (
            ModuleBomListItem.objects.filter(module__manufacturer=manufacturer)
            .values("components_options__description", "components_options__id")
            .annotate(total_quantity=Sum("quantity"))
            .order_by("-total_quantity")
        )

        # Add weighted_usage_score to each component usage entry.
        # Note: This score represents average usage per module.
        if total_modules > 0:
            for item in component_usage_quantity:
                item["weighted_usage_score"] = item["total_quantity"] / total_modules
        else:
            # Just in case there are no modules (to avoid division by zero)
            for item in component_usage_quantity:
                item["weighted_usage_score"] = 0

        # Create a sorted list of component IDs based on the main manufacturer's data
        sorted_component_ids = [
            item["components_options__id"] for item in component_usage_count
        ]

        # Get data for other manufacturers
        other_manufacturers = Manufacturer.objects.exclude(id=manufacturer.id)
        other_manufacturers_data = []
        for other_manufacturer in other_manufacturers:
            other_usage_count = (
                ModuleBomListItem.objects.filter(
                    module__manufacturer=other_manufacturer
                )
                .values("components_options__description", "components_options__id")
                .annotate(count=Count("id"))
                .order_by("components_options__description")
            )

            other_usage_quantity = (
                ModuleBomListItem.objects.filter(
                    module__manufacturer=other_manufacturer
                )
                .values("components_options__description", "components_options__id")
                .annotate(total_quantity=Sum("quantity"))
                .order_by("components_options__description")
            )

            # Sort other manufacturer data by the sorted component IDs
            sorted_other_usage_count = sorted(
                other_usage_count,
                key=lambda x: (
                    sorted_component_ids.index(x["components_options__id"])
                    if x["components_options__id"] in sorted_component_ids
                    else -1
                ),
            )
            sorted_other_usage_quantity = sorted(
                other_usage_quantity,
                key=lambda x: (
                    sorted_component_ids.index(x["components_options__id"])
                    if x["components_options__id"] in sorted_component_ids
                    else -1
                ),
            )

            color, border_color = generate_color_from_name(other_manufacturer.name)

            other_manufacturers_data.append(
                {
                    "name": other_manufacturer.name,
                    "color": color,
                    "border_color": border_color,
                    "component_usage_count": sorted_other_usage_count,
                    "component_usage_quantity": sorted_other_usage_quantity,
                }
            )

        context = {
            "manufacturer": manufacturer,
            "main_color": main_color,
            "main_border_color": main_border_color,
            "component_usage_count": list(component_usage_count),
            "component_usage_quantity": list(component_usage_quantity),
            "other_manufacturers": other_manufacturers_data,
            "total_modules": total_modules,  # if you wish to include it
        }

        # Cache the context data
        cache.set(cache_key, context, timeout=3600)  # Cache for 1 hour (3600 seconds)

    return render(request, "pages/manufacturers/manufacturer_detail.html", context)


@csrf_exempt
@api_view(["GET"])
def components_autocomplete(request):
    query = request.GET.get("q", "").strip()
    results = []

    if not query:
        return JsonResponse({"results": results})

    try:
        # Define the SearchVector across multiple fields, including related fields
        search_vector = (
            SearchVector("description", weight="A")
            + SearchVector("supplier_items__supplier__name", weight="B")
            + SearchVector("supplier_items__supplier_item_no", weight="B")
            + SearchVector("manufacturer__name", weight="C")
            + SearchVector("manufacturer_part_no", weight="C")
        )

        # Define the SearchQuery for natural language processing
        search_query = SearchQuery(query, search_type="websearch")

        # Apply full-text search and trigram similarity
        components = (
            Component.objects.annotate(
                search=search_vector,
                rank=SearchRank(search_vector, search_query),
                similarity=(
                    TrigramSimilarity("description", query)
                    + TrigramSimilarity("manufacturer__name", query)
                    + TrigramSimilarity("manufacturer_part_no", query)
                    + TrigramSimilarity("supplier_items__supplier__name", query)
                    + TrigramSimilarity("supplier_items__supplier_item_no", query)
                ),
            )
            .filter(Q(search=search_query) | Q(similarity__gt=0.1))
            .order_by("-rank", "-similarity")
            .distinct()[:50]
        )

        # Prepare the results for the response
        results = [
            {
                "id": comp.id,
                "text": comp.description,
                "suppliers": [
                    {
                        "name": item.supplier.name,
                        "item_no": item.supplier_item_no,
                    }
                    for item in comp.supplier_items.all()
                ],
            }
            for comp in components
        ]

    except Exception as e:
        return JsonResponse(
            {"error": "An error occurred during the search."},
            status=500,
        )

    return JsonResponse({"results": results})


@csrf_exempt
@api_view(["POST"])
def module_list_v2(request):
    data = request.data
    query = data.get("search", "")
    manufacturer = data.get("manufacturer", None)
    mounting_style = data.get("mounting_style", None)
    category = data.get("category", None)
    rack_unit = data.get("rack_unit", None)
    user = request.user if request.user.is_authenticated else None

    # Inline filter to include only component groups with a defined component
    component_groups = [
        {**group, "min": group.get("min", ""), "max": group.get("max", "")}
        for group in data.get("component_groups", [])
        if group.get("component")
    ]

    # Fetch component names based on IDs
    for group in component_groups:
        component_id = group.get("component")
        if component_id:
            try:
                component_uuid = UUID(component_id)
                component = Component.objects.get(id=component_uuid)
                group["component_description"] = component.description
            except (Component.DoesNotExist, ValueError):
                group["component_description"] = "Unknown Component"

    # Initial filtering by basic fields
    module_list = Module.objects.order_by("name")
    if manufacturer:
        module_list = module_list.filter(manufacturer__name__icontains=manufacturer)
    if mounting_style in ["th", "smt"]:
        module_list = module_list.filter(mounting_style=mounting_style)
    if category:
        module_list = module_list.filter(category=category)
    if rack_unit:
        module_list = module_list.filter(rack_unit=rack_unit)
    if query:
        module_list = module_list.filter(
            Q(name__icontains=query)
            | Q(manufacturer__name__icontains=query)
            | Q(description__icontains=query)
        )

    # Apply component group filters if they contain valid data
    for i, group in enumerate(component_groups):
        component = group.get("component")
        min_quantity = int(group.get("min", 0)) if group.get("min") else None
        max_quantity = int(group.get("max", 0)) if group.get("max") else None

        # Set up the component filter
        component_filter = (
            Q(modulebomlistitem__components_options__id=component) if component else Q()
        )

        # Determine min and max filters based on their availability
        if min_quantity not in [None, "", 0] and max_quantity in [None, ""]:
            # Min quantity set, max quantity unset -> min_quantity to infinity
            min_filter = Q(modulebomlistitem__quantity__gte=min_quantity)
            max_filter = Q()
        elif max_quantity not in [None, "", 0] and min_quantity in [None, ""]:
            # Max quantity set, min quantity unset -> 0 to max_quantity
            min_filter = Q(modulebomlistitem__quantity__gte=0)
            max_filter = Q(modulebomlistitem__quantity__lte=max_quantity)
        elif min_quantity not in [None, "", 0] and max_quantity not in [None, "", 0]:
            # Both min and max quantities are set
            min_filter = Q(modulebomlistitem__quantity__gte=min_quantity)
            max_filter = Q(modulebomlistitem__quantity__lte=max_quantity)
        else:
            # Neither min nor max is set; treat as "contains any"
            min_filter = Q()
            max_filter = Q()

        # Combine filters
        combined_filter = (
            component_filter
            if component and min_filter == Q() and max_filter == Q()
            else (component_filter & min_filter & max_filter)
        )

        # Apply each filter
        module_list = module_list.filter(combined_filter).distinct()

    # Annotate for user-specific data if the user is authenticated
    if user:
        module_list = module_list.annotate(
            is_built=Exists(
                BuiltModules.objects.filter(module=OuterRef("pk"), user=user)
            ),
            is_wtb=Exists(
                WantToBuildModules.objects.filter(module=OuterRef("pk"), user=user)
            ),
        )

    # Pagination and response
    paginator = Paginator(module_list, 10)
    page_number = data.get("page", 1)
    page_obj = paginator.get_page(page_number)
    module_serializer = ModuleSerializer(page_obj.object_list, many=True)

    return Response(
        {
            "modules": module_serializer.data,
            "pagination": {
                "currentPage": page_number,
                "nextPage": page_number + 1 if page_obj.has_next() else None,
                "hasNextPage": page_obj.has_next(),
                "totalPages": paginator.num_pages,
                "totalItems": paginator.count,
            },
            "filters": {
                "search": query,
                "manufacturer": manufacturer,
                "mounting_style": mounting_style,
                "category": category,
                "rack_unit": rack_unit,
                "component_groups": component_groups,
            },
        },
        status=status.HTTP_200_OK,
    )


@csrf_exempt
@api_view(["GET"])
@cache_page(CACHE_TIMEOUT)
def get_filter_options(request):
    """
    Endpoint for fetching filter options (manufacturers, mounting styles, categories, rack units).
    """
    manufacturers = Manufacturer.objects.values("name").distinct()
    manufacturers_serializer = ModuleManufacturerSerializer(manufacturers, many=True)

    mounting_style_options = [
        {"name": "Surface Mount (SMT)", "value": "smt"},
        {"name": "Through Hole", "value": "th"},
    ]
    category_options = [
        {"name": choice[1], "value": choice[0]} for choice in Module.CATEGORY_CHOICES
    ]
    rack_unit_options = [
        {"name": choice[1], "value": choice[0]} for choice in Module.RACK_UNIT_CHOICES
    ]

    return Response(
        {
            "manufacturers": manufacturers_serializer.data,
            "mountingStyleOptions": mounting_style_options,
            "categoryOptions": category_options,
            "rackUnitOptions": rack_unit_options,
        },
        status=status.HTTP_200_OK,
    )


@api_view(["GET"])
def get_suggested_components_for_bom_list_item(request, modulebomlistitem_pk):
    """
    Retrieve all suggested components for a given BOM List Item.
    """
    suggestions = SuggestedComponentForBomListItem.objects.filter(
        module_bom_list_item_id=modulebomlistitem_pk
    )

    if not suggestions.exists():
        return Response(
            {"detail": "No suggestions found for the specified BOM list item."},
            status=status.HTTP_404_NOT_FOUND,
        )

    serializer = SuggestedComponentDetailSerializer(suggestions, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def suggest_component_for_bom_list_item(request, modulebomlistitem_pk):
    """
    Handle POST requests to suggest a component for a BOM list item.

    Args:
        request: The HTTP request containing component suggestion data.
        modulebomlistitem_pk: The UUID of the ModuleBomListItem.

    Returns:
        Response: Success or error response.
    """
    try:
        # Ensure the ModuleBomListItem exists
        module_bom_list_item = ModuleBomListItem.objects.get(pk=modulebomlistitem_pk)
        logger.info(f"Module BOM List Item retrieved: {module_bom_list_item}")
    except ModuleBomListItem.DoesNotExist:
        logger.warning(f"Module BOM List Item not found: {modulebomlistitem_pk}")
        return Response(
            {"error": "The specified Module BOM List Item does not exist."},
            status=status.HTTP_404_NOT_FOUND,
        )

    request_data = request.data.copy()
    request_data["module_bom_list_item_id"] = str(modulebomlistitem_pk)

    serializer = SuggestedComponentForBomListItemSerializer(
        data=request_data, context={"request": request}
    )

    if not serializer.is_valid():
        logger.warning(f"Validation errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    try:
        with transaction.atomic():
            validated_data = serializer.validated_data
            logger.info("Validated data processed successfully")

            # Handle existing component
            if "component_id" in validated_data:
                component = Component.objects.get(id=validated_data["component_id"])
                logger.info(f"Existing component retrieved: {component}")
            else:
                # Create new component
                component_data = validated_data["component_data"]["component"]

                # Check for an existing component by manufacturer
                existing_component = Component.objects.filter(
                    manufacturer_part_no=component_data["manufacturer_part_no"]
                ).first()

                if existing_component:
                    logger.info(f"Existing component found: {existing_component}")
                    component = existing_component
                else:
                    manufacturer = ComponentManufacturer.objects.get(
                        id=component_data["manufacturer"]
                    )
                    component_type = Types.objects.get(id=component_data["type"])
                    component = Component.objects.create(
                        manufacturer=manufacturer,
                        type=component_type,
                        **{
                            k: v
                            for k, v in component_data.items()
                            if k not in ["manufacturer", "type"]
                        },
                    )
                    logger.info(f"New component created: {component}")

                    # Create supplier items
                    for supplier_item in validated_data["component_data"][
                        "supplier_items"
                    ]:
                        supplier = ComponentSupplier.objects.get(
                            id=supplier_item["supplier"]
                        )
                        ComponentSupplierItem.objects.create(
                            component=component,
                            supplier=supplier,
                            supplier_item_no=supplier_item["supplier_item_no"],
                            price=supplier_item["price"],
                            link=supplier_item.get("link"),
                        )
                        logger.info(f"Supplier item created for component: {component}")

            # Create the suggested component
            suggested_component = SuggestedComponentForBomListItem.objects.create(
                module_bom_list_item=module_bom_list_item,
                suggested_component=component,
                suggested_by=request.user if request.user.is_authenticated else None,
            )
            logger.info(
                f"SuggestedComponentForBomListItem created: {suggested_component}"
            )

            return Response(
                {
                    "id": str(suggested_component.id),
                    "module_bom_list_item": str(
                        suggested_component.module_bom_list_item.id
                    ),
                    "suggested_component": str(
                        suggested_component.suggested_component.id
                    ),
                    "status": suggested_component.status,
                },
                status=status.HTTP_201_CREATED,
            )
    except ComponentManufacturer.DoesNotExist:
        logger.error("Specified manufacturer does not exist")
        return Response(
            {"error": "The specified manufacturer does not exist."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    except Types.DoesNotExist:
        logger.error("Specified component type does not exist")
        return Response(
            {"error": "The specified component type does not exist."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    except ComponentSupplier.DoesNotExist:
        logger.error("Specified supplier does not exist")
        return Response(
            {"error": "The specified supplier does not exist."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    except Exception as e:
        logger.exception("Unexpected error occurred")
        return Response(
            {"error": "An unexpected error occurred."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
