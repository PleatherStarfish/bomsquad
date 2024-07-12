from django.urls import path
from modules.views import module_list
from .views import (
    AboutPageView,
    DisclaimerPageView,
    PremiumPageView,
    component_detail,
)
from django.views.generic import TemplateView
from comments.views import latest_comments


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
    path("components/<uuid:component_id>/", component_detail, name="component-detail"),
    path("community/", latest_comments, name="fetch_comments"),
]
