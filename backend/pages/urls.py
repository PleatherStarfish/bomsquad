from django.urls import path
from modules.views import module_list
from .views import (
    AboutPageView,
    DisclaimerPageView,
    TosView,
    PrivacyPolicyView,
    FAQView,
    component_detail,
)
from modules.views import manufacturer_detail
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
    path("faq/", FAQView.as_view(), name="faq"),
    path(
        "privacy-policy/",
        PrivacyPolicyView.as_view(),
        name="pp",
    ),
    path("community/", latest_comments, name="fetch_comments"),
    path(
        "manufacturer/<slug:slug>/",
        manufacturer_detail,
        name="manufacturer_detail",
    ),
]
