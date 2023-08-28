from django.urls import path
from modules.views import module_list
from .views import AboutPageView, DisclaimerPageView, PremiumPageView
from django.views.generic import TemplateView
from contact import views

urlpatterns = [
    path("", module_list, name="home"),
    path("about/", AboutPageView.as_view(), name="about"),
    path("disclaimer/", DisclaimerPageView.as_view(), name="disclaimer"),
    path("support/", PremiumPageView.as_view(), name="premium"),
    path(
        "thanks_for_subscribing/",
        TemplateView.as_view(template_name="pages/thanks_for_subscribing.html"),
        name="thanks_for_subscribing",
    ),
]
