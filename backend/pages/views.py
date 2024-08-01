from django.views.generic import TemplateView, DetailView
from .models import StaticPage
from components.models import Component
from django.shortcuts import render, get_object_or_404
from modules.models import ModuleBomListItem, Module


class HomePageView(TemplateView):
    template_name = "pages/home.html"


class StaticPageDetailView(DetailView):
    model = StaticPage
    template_name = "pages/page.html"
    context_object_name = "page"

    def get_object(self):
        return StaticPage.objects.filter(title=self.page_title).first()


class AboutPageView(StaticPageDetailView):
    page_title = "About"


class DisclaimerPageView(StaticPageDetailView):
    page_title = "Disclaimer"


class TosView(StaticPageDetailView):
    page_title = "Terms of Service"


class PrivacyPolicyView(StaticPageDetailView):
    page_title = "Privacy Policy"


class FAQView(StaticPageDetailView):
    page_title = "FAQ"


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
