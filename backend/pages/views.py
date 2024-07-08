from django.views.generic import TemplateView
from .models import Page
from django.views.generic.detail import DetailView
from components.models import Component


class HomePageView(TemplateView):
    template_name = "pages/home.html"


class AboutPageView(DetailView):
    model = Page
    template_name = "pages/page.html"
    context_object_name = "page"

    def get_object(self):
        return Page.objects.filter(title="About").first()


class DisclaimerPageView(DetailView):
    model = Page
    template_name = "pages/page.html"
    context_object_name = "page"

    def get_object(self):
        return Page.objects.filter(title="Disclaimer").first()


class PremiumPageView(DetailView):
    model = Page
    template_name = "pages/page.html"
    context_object_name = "page"

    def get_object(self):
        return Page.objects.filter(title="Support").first()


class ComponentDetailView(DetailView):
    model = Component
    template_name = "pages/components/component_detail.html"
    context_object_name = "component"
