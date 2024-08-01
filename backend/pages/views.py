from django.views.generic import TemplateView
from .models import StaticPage
from django.views.generic.detail import DetailView
from components.models import Component
from django.shortcuts import render, get_object_or_404
from modules.models import ModuleBomListItem, Module


class HomePageView(TemplateView):
    template_name = "pages/home.html"


class AboutPageView(DetailView):
    model = StaticPage
    template_name = "pages/page.html"  # Use the new template
    context_object_name = "page"

    def get_object(self):
        return StaticPage.objects.filter(title="About").first()


class DisclaimerPageView(DetailView):
    model = StaticPage
    template_name = "pages/page.html"
    context_object_name = "page"

    def get_object(self):
        return StaticPage.objects.filter(title="Disclaimer").first()


class TosView(DetailView):
    model = StaticPage
    template_name = "pages/page.html"
    context_object_name = "page"

    def get_object(self):
        return StaticPage.objects.filter(title="Terms of Service").first()


def component_detail(request, component_id):
    component = get_object_or_404(Component, id=component_id)
    module_items = ModuleBomListItem.objects.filter(components_options=component)
    modules = sorted(
        [
            {
                "module": item.module,
                "quantity": item.quantity,
                "slug": item.module.slug,
            }
            for item in module_items
        ],
        key=lambda x: x["module"].name,
    )
    return render(
        request,
        "pages/components/component_detail.html",
        {"component": component, "modules": modules, "back_url": "/components/"},
    )


def module_detail(request, slug):
    module = get_object_or_404(Module, slug=slug)
    return render(request, "frontend.html", {"module": module})
