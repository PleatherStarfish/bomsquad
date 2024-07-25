from django.urls import path
from contact.views import contact, subscription
from django.views.generic import TemplateView

urlpatterns = [
    path("", contact, name="contact"),
    path("subscribe/", subscription, name="subscription"),
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
