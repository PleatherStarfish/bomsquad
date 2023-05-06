from django import template
from django.urls import reverse

register = template.Library()


@register.simple_tag
def dropdown_items(user):
    items = [
        {"name": "Profile", "url": reverse("user", kwargs={"username": user.username})},
        {"name": "Change password", "url": reverse("account_change_password")},
        {"name": "Sign out", "url": reverse("account_logout")},
    ]
    return items
