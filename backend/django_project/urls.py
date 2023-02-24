from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.shortcuts import redirect
from django.views.generic import RedirectView
from django.contrib.auth.decorators import login_required
from modules import views as ModuleView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("accounts/", include("allauth.urls")),
    path("api/", include("api.urls")),
    path(
        "module/<slug:slug>/",
        RedirectView.as_view(url="http://127.0.0.1:3000/module/%(slug)s/"),
        name="module",
    ),
    path(
        "user/<str:username>/",
        RedirectView.as_view(url="http://127.0.0.1:3000/user/%(username)s/"),
        name="user",
    ),
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
urlpatterns += [
    re_path(
        r"^(?!media|admin|accounts|api|static|module|user).*",
        lambda request: redirect("http://127.0.0.1:3000/"),
    ),
]
