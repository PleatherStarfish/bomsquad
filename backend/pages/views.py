from django.views.generic import TemplateView
from .models import Page
from django.views.generic.detail import DetailView


class HomePageView(TemplateView):
    template_name = "pages/home.html"


class AboutPageView(DetailView):
    model = Page
    template_name = "pages/about.html"
    context_object_name = "page"

    def get_object(self):
        return Page.objects.filter(title="About").first()


class DisclaimerPageView(TemplateView):
    template_name = "pages/disclaimer.html"


class PremiumPageView(TemplateView):
    template_name = "pages/premium.html"
