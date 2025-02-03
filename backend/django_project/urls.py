from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import RedirectView, TemplateView
from django.contrib.auth.decorators import login_required
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from modules import views as ModuleView
from comments.views import edit_comment, delete_comment
from pages.views import module_detail
from django_otp.admin import OTPAdminSite
from core.views import robots_txt
from django.contrib.sitemaps import views as sitemap_views
from core.sitemaps import (
    ProjectSitemap,
    ManufacturerSitemap,
    ComponentSitemap,
    StaticViewSitemap,
    BlogSitemap,
)
from django.views.decorators.cache import cache_page
import admin_honeypot

# ----------------------------
# Admin and Security Setup
# ----------------------------

# Enable OTP on the admin site.
admin.site.__class__ = OTPAdminSite

# ----------------------------
# Sitemaps Configuration
# ----------------------------
sitemaps = {
    "projects": ProjectSitemap,
    "manufacturers": ManufacturerSitemap,
    "components": ComponentSitemap,
    "static": StaticViewSitemap,
    "blog": BlogSitemap,
}

# ----------------------------
# API Documentation Setup
# ----------------------------
schema_view = get_schema_view(
    openapi.Info(
        title="BOM Squad API",
        default_version="v1",
        description="API documentation for BOM Squad",
    ),
    public=False,
    permission_classes=(permissions.IsAdminUser,),
)


# ----------------------------
# Helper Functions for Frontend Views
# ----------------------------
def frontend_view():
    """
    Return a generic frontend view that serves the React app.
    """
    return TemplateView.as_view(template_name="frontend.html")


def secure_frontend_view():
    """
    Return a login-required frontend view.
    """
    return login_required(frontend_view())


# ----------------------------
# Frontend Redirect URLs (for SPA and API docs)
# ----------------------------
frontend_redirect_urls = [
    # Generic frontend route for 'generic/...' URLs.
    re_path(
        r"^generic/.+$",
        frontend_view(),
        name="frontend",
    ),
    # Swagger / Redoc API documentation endpoints.
    re_path(
        r"^swagger(?P<format>\.json|\.yaml)$",
        schema_view.without_ui(cache_timeout=0),
        name="schema-json",
    ),
    path(
        "swagger/",
        schema_view.with_ui("swagger", cache_timeout=0),
        name="schema-swagger-ui",
    ),
    path(
        "redoc/",
        schema_view.with_ui("redoc", cache_timeout=0),
        name="schema-redoc",
    ),
    # Maintenance mode URLs.
    re_path(r"^maintenance-mode/", include("maintenance_mode.urls")),
    # Comments URLs from django_comments_xtd.
    path("comments/", include("django_comments_xtd.urls")),
    # Module detail view.
    path("projects/<slug:slug>/", module_detail, name="module"),
    # User-specific routes that require login.
    path("user/<str:username>/", secure_frontend_view(), name="user"),
    path("user/<str:username>/built/", secure_frontend_view(), name="user-built"),
    path(
        "user/<str:username>/want-to-build/",
        secure_frontend_view(),
        name="user-want-to-build",
    ),
    path(
        "user/<str:username>/inventory/tree/",
        secure_frontend_view(),
        name="user-inventory-tree",
    ),
    path(
        "user/<str:username>/inventory/", secure_frontend_view(), name="user-inventory"
    ),
    path(
        "user/<str:username>/inventory/version-history/",
        secure_frontend_view(),
        name="user-inventory-version-history",
    ),
    path(
        "user/<str:username>/shopping-list/saved-lists/",
        secure_frontend_view(),
        name="user-inventory-saved-lists",
    ),
    path(
        "user/<str:username>/shopping-list/",
        secure_frontend_view(),
        name="user-shopping-list",
    ),
    path("user/<str:username>/settings/", secure_frontend_view(), name="user-settings"),
    # Catch-all route for frontend URLs (excludes media, admin, accounts, api, static, user)
    re_path(r"^(?!media|admin|accounts|api|static|user).*", frontend_view()),
]

# ----------------------------
# Main URL Patterns
# ----------------------------
urlpatterns = [
    # Serve ads.txt as a static text file.
    path(
        "ads.txt",
        TemplateView.as_view(template_name="ads.txt", content_type="text/plain"),
    ),
    # Admin routes: honeypot and actual admin.
    path("admin/", include("admin_honeypot.urls", namespace="admin_honeypot")),
    path("patchbay/", admin.site.urls),
    # Authentication and third-party apps.
    path("accounts/", include("allauth.urls")),
    path("blog/", include("blog.urls")),
    # Sitemaps (with caching).
    path(
        "sitemap.xml/",
        cache_page(86400)(sitemap_views.index),
        {"sitemaps": sitemaps},
        name="sitemap-index",
    ),
    path(
        "sitemap-<section>.xml",
        cache_page(86400)(sitemap_views.sitemap),
        {"sitemaps": sitemaps},
        name="django.contrib.sitemaps.views.sitemap",
    ),
    # robots.txt route.
    path("robots.txt/", robots_txt, name="robots-txt"),
    # Redirect /user/ to the frontend route (acts as a fallback).
    path("user/", RedirectView.as_view(pattern_name="frontend")),
    # API and Contact endpoints.
    path("api/", include("api.urls")),
    path("contact/", include("contact.urls")),
    # Module actions that require login.
    path(
        "add-to-built/<uuid:module_id>/",
        login_required(ModuleView.add_module_to_built),
        name="add_to_built",
    ),
    path(
        "add-to-wtb/<uuid:module_id>/",
        login_required(ModuleView.add_module_to_wtb),
        name="add_to_wtb",
    ),
    # Other page routes and comment editing.
    path("", include("pages.urls")),
    path("comments/edit/<int:comment_id>/", edit_comment, name="comments-edit"),
    path("comments/delete/<int:comment_id>/", delete_comment, name="comments-delete"),
    # EditorJS integration.
    path("editorjs/", include("django_editorjs_fields.urls")),
]

# Serve media files during development.
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Include the frontend (React) routes.
urlpatterns.extend(frontend_redirect_urls)

# Final catch-all route to render a custom 404 page.
urlpatterns.append(
    re_path(
        r"^.*",
        TemplateView.as_view(template_name="404.html"),
        {"exception": Exception("Page not Found")},
    )
)
