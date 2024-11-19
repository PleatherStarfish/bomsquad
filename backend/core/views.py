from django.http import HttpResponse
from django.shortcuts import render
from modules.models import Module, Manufacturer
from django.views.decorators.cache import cache_page
from django.urls import reverse
from components.models import Component


def robots_txt(request):
    lines = [
        "User-agent: *",
        "Disallow: /admin/",
        "Disallow: /accounts/",
        "Disallow: /api/",
        "Disallow: /contact/",
        "Disallow: /user/",
    ]
    return HttpResponse("\n".join(lines), content_type="text/plain")


# @cache_page(60 * 60)  # Cache this view for 60 minutes
def homepage(request):
    # Fetch the most recent modules that are not under construction
    modules = Module.objects.filter(bom_under_construction=False).order_by(
        "-datetime_created", "-datetime_updated"
    )[:3]

    # Prepare data to include thumbnail, title, manufacturer name, and URLs
    project_data = [
        {
            "title": module.name,
            "thumbnail": (
                module.thumb_image_jpeg.url
                if module.thumb_image_jpeg
                else module.thumb_image_webp.url if module.thumb_image_webp else None
            ),
            "manufacturer": module.manufacturer.name,
            "module_url": module.get_absolute_url(),
            "manufacturer_url": reverse(
                "manufacturer_detail", args=[module.manufacturer.slug]
            ),
        }
        for module in modules
    ]

    # Calculate counts
    project_count = Module.objects.count()
    component_count = Component.objects.count()
    manufacturer_count = Manufacturer.objects.count()

    component_count_display = f"{(component_count // 5) * 5}+"

    context = {
        "projects": project_data,
        "project_count": project_count,
        "component_count": component_count_display,
        "manufacturer_count": manufacturer_count,
    }

    return render(request, "pages/home.html", context)
