from django import template
from django.urls import reverse
from urllib.parse import urlparse, urlunparse
import math

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
def query_transform(request, excluding=[]):
    query_dict = request.GET.copy()
    if isinstance(excluding, list):
        for exclude in excluding:
            query_dict.pop(exclude, None)
    elif excluding:  # Single value exclusion
        query_dict.pop(excluding, None)
    return query_dict.urlencode()


@register.simple_tag
def zip_lists(*args):
    """Custom template tag to zip multiple lists together."""
    return list(zip(*args))


@register.filter
def get_display_name(value, mounting_style_options):
    for option in mounting_style_options:
        if option["value"] == value:
            return option["name"]
    return value


@register.filter
def force_https_and_remove_trailing_slash(url):
    """
    Ensures the URL uses HTTPS and removes the trailing slash if it exists.
    """
    parsed_url = urlparse(url)
    # Force HTTPS
    scheme = "https"
    # Remove trailing slash
    path = parsed_url.path
    # Rebuild the URL
    updated_url = urlunparse(
        (
            scheme,
            parsed_url.netloc,
            path,
            parsed_url.params,
            parsed_url.query,
            parsed_url.fragment,
        )
    )
    return updated_url


units = {"farad": ["F", "mF", "µF", "nF", "pF"], "ohm": ["Ω", "kΩ", "MΩ"]}

conversion_factors = {
    "F": 1,
    "mF": 1e-3,
    "µF": 1e-6,
    "μF": 1e-6,
    "nF": 1e-9,
    "pF": 1e-12,
    "Ω": 1,
    "kΩ": 1e3,
    "MΩ": 1e6,
}


def format_number(num):
    return f"{num:,.6f}".rstrip("0").rstrip(".")


def generate_conversions(value, unit, unit_type):
    try:
        parsed_value = float(value)
    except ValueError:
        return "<li>Invalid value</li>"

    base_value = parsed_value * conversion_factors.get(unit, 1)
    if math.isnan(base_value):
        return "<li>Invalid unit</li>"

    conversions = [
        f"<li>{format_number(base_value / conversion_factors[u])} {u}</li>"
        for u in units[unit_type]
    ]
    return "".join(conversions)


@register.filter
def farad_conversions(value, unit="µF"):
    return f"<ul>{generate_conversions(value, unit, 'farad')}</ul>"


@register.filter
def ohm_conversions(value, unit="Ω"):
    return f"<ul>{generate_conversions(value, unit, 'ohm')}</ul>"
