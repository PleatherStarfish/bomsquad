from django.urls import path
from . import views
from django.views.generic import TemplateView

urlpatterns = [
    path("", views.contact, name="contact"),
    path("subscribe/", views.subscription, name="subscription"),
    path(
        "success/",
        TemplateView.as_view(template_name="contact/success.html"),
        name="success",
    ),
    path(
        "error/",
        TemplateView.as_view(template_name="contact/spam_keyword.html"),
        name="spam",
    ),
]
