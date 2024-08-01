from django.urls import path
from modules.views import module_list
from .views import (
    AboutPageView,
    DisclaimerPageView,
    TosView,
    component_detail,
)
from django.views.generic import TemplateView
from comments.views import latest_comments


urlpatterns = [
    path("", module_list, name="home"),
    path("about/", AboutPageView.as_view(), name="about"),
    path("disclaimer/", DisclaimerPageView.as_view(), name="disclaimer"),
    path(
        "thanks_for_subscribing/",
        TemplateView.as_view(template_name="pages/thanks_for_subscribing.html"),
        name="thanks_for_subscribing",
    ),
    path(
        "components/<uuid:component_id>/",
        component_detail,
        name="component-detail",
    ),
    path("tos/", TosView.as_view(), name="tos"),
    path("community/", latest_comments, name="fetch_comments"),
]
