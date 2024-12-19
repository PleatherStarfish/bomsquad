from django.http import HttpResponse
from django.shortcuts import render
from modules.models import Module, Manufacturer
from django.views.decorators.cache import cache_page
from django.urls import reverse
from components.models import Component
from django.db import connection
from datetime import timedelta
from django.utils.timezone import now
from accounts.models import ExchangeRate
from core.openexchangerates import get_latest_exchange_rates


def get_exchange_rate(target_currency: str) -> float:
    print("TEST")
    """
    Retrieve the exchange rate for the given target currency against USD.

    If the rate exists in the database and is fresh (updated within the last 24 hours),
    it will return the cached value. Otherwise, it fetches the latest rate from the
    Open Exchange Rates API, updates the database, and returns the rate.

    Args:
        target_currency (str): The target currency code (e.g., "EUR", "GBP").

    Returns:
        float: The exchange rate for USD to the target currency.

    Raises:
        ValueError: If the exchange rate is not available for the given currency.
    """
    target_currency = target_currency.upper()

    # Validate input
    if not target_currency or len(target_currency) != 3:
        raise ValueError(f"Invalid target currency: {target_currency}")

    # Try to retrieve from the database
    exchange_rate = ExchangeRate.objects.filter(
        base_currency="USD", target_currency=target_currency
    ).first()
    print(exchange_rate)

    if exchange_rate and exchange_rate.last_updated > now() - timedelta(hours=24):
        # Return the cached rate if it's fresh
        return exchange_rate.rate

    # Fetch the latest rates from the API
    try:
        rates = get_latest_exchange_rates(base_currency="USD")
        rate = rates.get("rates", {}).get(target_currency)
    except Exception as e:
        raise ValueError(f"Failed to fetch exchange rates: {e}")

    if rate is None:
        raise ValueError(f"Exchange rate not available for USD to {target_currency}")

    # Update or create the exchange rate record
    if exchange_rate:
        exchange_rate.rate = rate
        exchange_rate.last_updated = now()
        exchange_rate.save()
    else:
        ExchangeRate.objects.create(
            base_currency="USD",
            target_currency=target_currency,
            rate=rate,
        )

    return rate


def robots_txt(request):
    lines = [
        "User-agent: *",
        "Disallow: /admin/",
        "Disallow: /accounts/",
        "Disallow: /api/",
        "Disallow: /contact/",
        "Disallow: /user/",
    ]
    return HttpResponse("\n".join(lines), content_type="text/plain")


def homepage(request):
    # Fetch the most recent modules that are not under construction
    modules = Module.objects.filter(bom_under_construction=False).order_by(
        "-datetime_created", "-datetime_updated"
    )[:3]

    # Prepare data to include thumbnail, title, manufacturer name, and URLs
    project_data = [
        {
            "title": module.name,
            "thumbnail": (
                module.thumb_image_jpeg.url
                if module.thumb_image_jpeg
                else module.thumb_image_webp.url if module.thumb_image_webp else None
            ),
            "manufacturer": module.manufacturer.name,
            "module_url": module.get_absolute_url(),
            "manufacturer_url": reverse(
                "manufacturer_detail", args=[module.manufacturer.slug]
            ),
        }
        for module in modules
    ]

    # Calculate counts
    project_count = Module.objects.count()
    component_count = Component.objects.count()
    manufacturer_count = Manufacturer.objects.count()

    component_count_display = f"{(component_count // 5) * 5}+"

    context = {
        "user": request.user,
        "projects": project_data,
        "project_count": project_count,
        "component_count": component_count_display,
        "manufacturer_count": manufacturer_count,
    }

    return render(request, "pages/home.html", context)
