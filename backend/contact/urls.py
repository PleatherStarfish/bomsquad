from django.urls import path
from contact.views import contact, subscription
from django.views.generic import TemplateView
from contact.views import success, spam, error

urlpatterns = [
    path("", contact, name="contact"),
    path("subscribe/", subscription, name="subscription"),
    path(
        "thanks_for_subscribing/",
        TemplateView.as_view(template_name="contact/thanks_for_subscribing.html"),
        name="thanks_for_subscribing",
    ),
    path("success/", success, name="success"),
    path("spam/", spam, name="spam"),
    path("error/", error, name="error"),
]
