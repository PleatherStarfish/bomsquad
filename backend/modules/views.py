from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from django.db.models import Q, Sum, Count, Exists, OuterRef, Avg, F
from django.template.loader import render_to_string
from django.http import JsonResponse
from django.core.cache import cache
from components.models import Component
from itertools import zip_longest

from django.shortcuts import get_object_or_404, redirect, render
from modules.models import (
    BuiltModules,
    Manufacturer,
    Module,
    WantToBuildModules,
    ModuleBomListItem,
    ModuleBomListComponentForItemRating,
)
from modules.serializers import (
    BuiltModuleSerializer,
    ModuleSerializer,
    WantTooBuildModuleSerializer,
    ModuleBomListItemSerializer,
    ModuleBomListComponentForItemRatingSerializer,
)
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

import hashlib


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
    module_list = Module.objects.order_by("name")

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
    module_bom_list_items = ModuleBomListItem.objects.filter(module=module).order_by(
        "-pcb_version__order"
    )

    if request.user.is_authenticated:
        # Use aggregation to sum quantities of UserInventory instances for each component in the queryset
        module_bom_list_items = module_bom_list_items.annotate(
            sum_of_user_options_from_inventory=Sum(
                "components_options__userinventory__quantity",
                filter=Q(components_options__userinventory__user=request.user),
                distinct=True,
            ),
            sum_of_user_options_from_shopping_list=Sum(
                "components_options__usershoppinglist__quantity",
                filter=Q(components_options__usershoppinglist__user=request.user),
                distinct=True,
            ),
        )

    # Serialize the retrieved ModuleBomListItem instances
    serializer = ModuleBomListItemSerializer(module_bom_list_items, many=True)

    # Return the serialized data as a response
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
            return Response(
                {
                    "average_rating": average_rating,
                    "number_of_ratings": result["number_of_ratings"],
                },
                status=status.HTTP_200_OK,
            )
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
        }

        # Cache the context data
        cache.set(cache_key, context, timeout=3600)  # Cache for 1 hour (3600 seconds)

    return render(request, "pages/manufacturers/manufacturer_detail.html", context)


def component_autocomplete(request):
    query = request.GET.get("q", "")
    if query:
        # Filter components by description or other relevant fields
        components = Component.objects.filter(description__icontains=query)[:10]
        results = [{"id": comp.id, "text": comp.description} for comp in components]
    else:
        results = []

    return JsonResponse({"results": results})
