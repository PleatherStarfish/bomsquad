from django import template
from django.urls import reverse

register = template.Library()


@register.simple_tag
def dropdown_items(user, preset=None):
    items = [
        {"name": "Profile", "url": reverse("user", kwargs={"username": user.username})},
        {"name": "Sign out", "url": reverse("account_logout")},
    ]

    if preset != "suppress_change_password":
        items.insert(
            1, {"name": "Change password", "url": reverse("account_change_password")}
        )

    return items
