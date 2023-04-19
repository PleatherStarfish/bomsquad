from django.urls import path
from modules.views import module_list
from .views import AboutPageView, DisclaimerPageView

urlpatterns = [
    path("", module_list, name="home"),
    path("about/", AboutPageView.as_view(), name="about"),
    path("disclaimer/", DisclaimerPageView.as_view(), name="disclaimer"),
]
