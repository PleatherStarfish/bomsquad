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
from modules.views import components_autocomplete
from pages.views import module_detail
from django_otp.admin import OTPAdminSite
from core.views import robots_txt
from django.contrib.sitemaps.views import sitemap
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


# Custom OTP-enabled admin site
admin.site.__class__ = OTPAdminSite

sitemaps = {
    "projects": ProjectSitemap,
    "manufacturers": ManufacturerSitemap,
    "components": ComponentSitemap,
    "static": StaticViewSitemap,
    "blog": BlogSitemap,
}


schema_view = get_schema_view(
    openapi.Info(
        title="BOM Squad API",
        default_version="v1",
        description="API documentation for BOM Squad",
    ),
    public=False,
    permission_classes=(permissions.IsAdminUser,),
)

frontend_redirect_urls = [
    re_path(
        r"^generic/.+$",
        TemplateView.as_view(template_name="frontend.html"),
        name="frontend",
    ),
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
    re_path(r"^maintenance-mode/", include("maintenance_mode.urls")),
    path(r"comments/", include("django_comments_xtd.urls")),
    path(
        "projects/<slug:slug>/",
        module_detail,
        name="module",
    ),
    path(
        "user/<str:username>/",
        login_required(TemplateView.as_view(template_name="frontend.html")),
        name="user",
    ),
    path(
        "user/<str:username>/built/",
        login_required(TemplateView.as_view(template_name="frontend.html")),
        name="user-built",
    ),
    path(
        "user/<str:username>/want-to-build/",
        login_required(TemplateView.as_view(template_name="frontend.html")),
        name="user-want-to-build",
    ),
    path(
        "user/<str:username>/inventory/tree/",
        login_required(TemplateView.as_view(template_name="frontend.html")),
        name="user-inventory-tree",
    ),
    path(
        "user/<str:username>/inventory/",
        login_required(TemplateView.as_view(template_name="frontend.html")),
        name="user-inventory",
    ),
    path(
        "user/<str:username>/inventory/version-history/",
        login_required(TemplateView.as_view(template_name="frontend.html")),
        name="user-inventory-version-history",
    ),
    path(
        "user/<str:username>/shopping-list/saved-lists/",
        login_required(TemplateView.as_view(template_name="frontend.html")),
        name="user-inventory-saved-lists",
    ),
    path(
        "user/<str:username>/shopping-list/",
        login_required(TemplateView.as_view(template_name="frontend.html")),
        name="user-shopping-list",
    ),
    path(
        "user/<str:username>/settings/",
        login_required(TemplateView.as_view(template_name="frontend.html")),
        name="user-settings",
    ),
    re_path(
        r"^(?!media|admin|accounts|api|static|user).*",
        TemplateView.as_view(template_name="frontend.html"),
    ),
]


urlpatterns = [
    path(
        "ads.txt",
        TemplateView.as_view(template_name="ads.txt", content_type="text/plain"),
    ),
    path("admin/", include("admin_honeypot.urls", namespace="admin_honeypot")),
    path("patchbay/", admin.site.urls),
    path("accounts/", include("allauth.urls")),
    path("blog/", include("blog.urls")),
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
    path("robots.txt/", robots_txt, name="robots-txt"),
    path("user/", RedirectView.as_view(pattern_name="frontend")),
    path("api/", include("api.urls")),
    path("contact/", include("contact.urls")),
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
    path("", include("pages.urls")),
    path("comments/edit/<int:comment_id>/", edit_comment, name="comments-edit"),
    path("comments/delete/<int:comment_id>/", delete_comment, name="comments-delete"),
    path("editorjs/", include("django_editorjs_fields.urls")),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Redirect all other URLs to the React app
urlpatterns.extend(frontend_redirect_urls)

urlpatterns.append(
    re_path(
        r"^.*",
        TemplateView.as_view(template_name="404.html"),
        {"exception": Exception("Page not Found")},
    )
)
