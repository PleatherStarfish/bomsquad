from django.core.paginator import Paginator
from django.db.models import Q
from django.shortcuts import render, redirect

from .models import Module, Manufacturer
from django.contrib import messages
from .models import BuiltModules, WantToBuildModules
from django.contrib.auth.decorators import login_required
from rest_framework.decorators import api_view
from django.contrib.auth.decorators import login_required
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required

mounting_style_options = [
    {"name": "Surface Mount (SMT)", "value": "smt"},
    {"name": "Through Hole", "value": "th"},
]


def module_list(request):
    query = request.GET.get("search", "")
    manufacturer = request.GET.get("manufacturer", None)
    mounting_style = request.GET.get("mounting_style", None)
    module_list = Module.objects.order_by("name")

    if manufacturer:
        module_list = module_list.filter(manufacturer__name__icontains=manufacturer)

    if mounting_style:
        module_list = module_list.filter(mounting_style=mounting_style)

    if query:
        module_list = module_list.filter(
            Q(name__icontains=query)
            | Q(manufacturer__name__icontains=query)
            | Q(description__icontains=query)  # Add this line
        ).order_by("name")

    paginator = Paginator(module_list, 10)
    page_number = request.GET.get("page")
    page_obj = paginator.get_page(page_number)
    manufacturers = Manufacturer.objects.values("name").distinct()

    user = request.user if request.user.is_authenticated else None
    if user:
        for module in page_obj:
            module.is_built = module.is_built_by_user(user)
            module.is_wtb = module.is_wtb_by_user(user)

    return render(
        request,
        "modules/index.html",
        {
            "page_obj": page_obj,
            "manufacturers": manufacturers,
            "search": query,
            "manufacturer": manufacturer,
            "mounting_style": mounting_style_options,
            "user_logged_in": request.user.is_authenticated,
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
