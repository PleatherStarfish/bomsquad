from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.shortcuts import redirect
from django.views.generic import RedirectView, TemplateView
from django.contrib.auth.decorators import login_required

from modules import views as ModuleView


frontend_redirect_urls = [
    re_path(
        r"^generic/.+$",
        TemplateView.as_view(template_name="frontend.html"),
        name="frontend",
    ),
    path(
        "module/<slug:slug>/",
        TemplateView.as_view(template_name="frontend.html"),
        name="module",
    ),
    path(
        "user/<str:username>/",
        TemplateView.as_view(template_name="frontend.html"),
        name="user",
    ),
    path(
        "user/<str:username>/built/",
        TemplateView.as_view(template_name="frontend.html"),
        name="user-built",
    ),
    path(
        "user/<str:username>/want-to-build/",
        TemplateView.as_view(template_name="frontend.html"),
        name="user-want-to-build",
    ),
    path(
        "user/<str:username>/inventory/",
        TemplateView.as_view(template_name="frontend.html"),
        name="user-inventory",
    ),
    path(
        "user/<str:username>/inventory/version-history/",
        TemplateView.as_view(template_name="frontend.html"),
        name="user-inventory-version-history",
    ),
    path(
        "user/<str:username>/shopping-list/",
        TemplateView.as_view(template_name="frontend.html"),
        name="user-shopping-list",
    ),
    path(
        "user/<str:username>/settings/",
        TemplateView.as_view(template_name="frontend.html"),
        name="user-settings",
    ),
    re_path(
        r"^(?!media|admin|accounts|api|static|module|user).*",
        TemplateView.as_view(template_name="frontend.html"),
    ),
]


urlpatterns = [
    path("patchbay/", admin.site.urls),
    path("accounts/", include("allauth.urls")),
    path("user/", RedirectView.as_view(pattern_name="frontend")),
    path("api/", include("api.urls")),
    path(
        "add-to-built/<int:module_id>/",
        login_required(ModuleView.add_module_to_built),
        name="add_to_built",
    ),
    path(
        "add-to-wtb/<int:module_id>/",
        login_required(ModuleView.add_module_to_wtb),
        name="add_to_wtb",
    ),
    path("", include("pages.urls")),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Redirect all other URLs to the React app
urlpatterns.extend(frontend_redirect_urls)
