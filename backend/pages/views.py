from django.views.generic import TemplateView
from .models import Page
from django.views.generic.detail import DetailView


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
