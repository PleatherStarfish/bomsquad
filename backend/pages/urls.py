from django.urls import path
from modules import views as ModuleView
from .views import AboutPageView

urlpatterns = [
    path("", ModuleView.module_list, name="home"),
    path("about/", AboutPageView.as_view(), name="about"),
]
