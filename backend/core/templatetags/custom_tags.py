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


@register.simple_tag
def query_transform(request, excluding=None):
    query = request.GET.copy()
    if excluding:
        query.pop(excluding, None)
    return query.urlencode()


@register.filter
def get_mounting_style_name(value, mounting_style_options):
    for option in mounting_style_options:
        if option["value"] == value:
            return option["name"]
    return value
