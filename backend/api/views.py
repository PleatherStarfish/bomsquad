from rest_framework import generics
from django.shortcuts import get_object_or_404
from modules.models import Module
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
