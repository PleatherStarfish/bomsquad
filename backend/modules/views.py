from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from django.db.models import Q
from django.shortcuts import get_object_or_404, redirect, render
from modules.models import BuiltModules, Module, WantToBuildModules
from modules.serializers import (
    BuiltModuleSerializer,
    ModuleSerializer,
    WantTooBuildModuleSerializer,
)
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import BuiltModules, Manufacturer, Module, WantToBuildModules

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
