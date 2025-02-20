from decimal import Decimal
import statistics
from django.http import HttpResponse
from django.shortcuts import render
from blog.models import BlogPost
from modules.models import Module, Manufacturer, ModuleBomListItem
from django.views.decorators.cache import cache_page
from django.urls import reverse
from components.models import Component
from django.db import connection
from datetime import timedelta
from django.utils.timezone import now
from accounts.models import ExchangeRate
from sentry_sdk import capture_exception
from core.openexchangerates import _get_latest_exchange_rates
from django.conf import settings
from django.db.models import Sum, Avg, F


CURRENCIES = [
    ("USD", "US Dollar"),
    ("EUR", "Euro"),
    ("JPY", "Japanese Yen"),
    ("GBP", "British Pound"),
    ("AUD", "Australian Dollar"),
    ("CAD", "Canadian Dollar"),
    ("CHF", "Swiss Franc"),
    ("CNY", "Chinese Yuan"),
    ("HKD", "Hong Kong Dollar"),
    ("NZD", "New Zealand Dollar"),
    ("SEK", "Swedish Krona"),
    ("KRW", "South Korean Won"),
    ("SGD", "Singapore Dollar"),
    ("NOK", "Norwegian Krone"),
    ("INR", "Indian Rupee"),
]


def get_exchange_rate(base_currency: str, target_currency: str) -> float:
    """
    Retrieve the exchange rate from the given base currency to the target currency.

    If the rate exists in the database and is fresh (updated within the last 24 hours),
    it will return the cached value. Otherwise, it fetches the latest rate from the
    Open Exchange Rates API, updates the database, and returns the rate.

    Args:
        base_currency (str): The base currency code (e.g., "USD", "EUR").
        target_currency (str): The target currency code (e.g., "EUR", "GBP").

    Returns:
        float: The exchange rate for base_currency to target_currency.

    Raises:
        ValueError: If the exchange rate is not available for the given currencies.
    """
    base_currency = base_currency.upper()
    target_currency = target_currency.upper()

    # Validate input against the predefined currency list
    valid_currencies = {code for code, _ in CURRENCIES}
    if base_currency not in valid_currencies:
        raise ValueError(f"Invalid base currency: {base_currency}")
    if target_currency not in valid_currencies:
        raise ValueError(f"Invalid target currency: {target_currency}")

    # If base and target currencies are the same, the exchange rate is always 1.0
    if base_currency == target_currency:
        return 1.0

    # Try to retrieve from the database
    exchange_rate = ExchangeRate.objects.filter(
        base_currency=base_currency, target_currency=target_currency
    ).first()

    if exchange_rate and exchange_rate.last_updated > now() - timedelta(hours=24):
        # Return the cached rate if it's fresh
        return exchange_rate.rate

    # Fetch the latest rate from the API
    try:
        rate = _get_latest_exchange_rates(base_currency, target_currency)
        if rate is None:
            raise ValueError(
                f"Exchange rate not available for {base_currency} to {target_currency}"
            )
    except Exception as e:
        capture_exception(e)
        raise ValueError(f"Failed to fetch exchange rates: {e}")

    # Update the record if it exists, or create a new one
    if exchange_rate and rate:
        exchange_rate.rate = rate
        exchange_rate.last_updated = now()
        exchange_rate.save()
    else:
        ExchangeRate.objects.create(
            base_currency=base_currency,
            target_currency=target_currency,
            rate=rate,
        )

    return rate


def robots_txt(request):
    if settings.DEBUG:
        # In development (DEBUG mode), disallow everything.
        lines = [
            "User-agent: *",
            "Disallow: /",
        ]
    else:
        # In production, only disallow specific paths.
        lines = [
            "User-agent: *",
            "Disallow: /admin/",
            "Disallow: /accounts/",
            "Disallow: /api/",
            "Disallow: /contact/",
            "Disallow: /user/",
            "Sitemap: https://bom-squad.com/sitemap.xml",
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

    # Fetch the top two published blog posts
    blog_posts = BlogPost.objects.filter(published=True).order_by("-datetime_created")[
        :2
    ]

    blog_data = [
        {
            "title": post.title,
            "thumbnail": (
                post.thumb_image_jpeg.url
                if post.thumb_image_jpeg
                else post.thumb_image_webp.url if post.thumb_image_webp else None
            ),
            "excerpt": post.get_plain_text_excerpt(),
            "post_url": post.get_absolute_url(),
        }
        for post in blog_posts
    ]

    # Calculate counts
    project_count = Module.objects.count()
    component_count = Component.objects.count()
    manufacturer_count = Module.objects.values("manufacturer").distinct().count()
    component_count_display = f"{(component_count // 5) * 5}+"

    # Compute DIY vs Assembled/Kit Savings

    modules_with_costs = Module.objects.filter(
        cost_built__isnull=False, cost_built__gt=0
    ).values("id", "cost_built", "cost_kit", "cost_pcb_only", "cost_pcb_plus_front")

    cost_differences = {
        "pcb_only_vs_assembled": [],
        "pcb_plus_front_vs_assembled": [],
        "pcb_only_vs_kit": [],
        "pcb_plus_front_vs_kit": [],
    }

    for module in modules_with_costs:
        module_id = module["id"]
        cost_built = module["cost_built"] or Decimal("0")
        cost_kit = module["cost_kit"] or Decimal("0")
        cost_pcb_only = module["cost_pcb_only"] or Decimal("0")
        cost_pcb_plus_front = module["cost_pcb_plus_front"] or Decimal("0")

        # Calculate DIY cost from BOM (typically representing the DIY kit build)
        bom_stats = (
            ModuleBomListItem.objects.filter(module_id=module_id)
            .annotate(
                diy_cost=Sum(
                    F("components_options__supplier_items__unit_price") * F("quantity")
                )
            )
            .aggregate(avg_diy=Avg("diy_cost"))
        )
        diy_cost = bom_stats["avg_diy"] or Decimal("0")
        if diy_cost == 0:
            continue  # Skip modules where DIY cost is missing

        # For Assembled comparisons, use cost_built as the baseline.
        if cost_built > 0:
            # PCB Only vs Assembled: How much cheaper is PCB Only compared to the assembled cost?
            if cost_pcb_only > 0:
                cost_differences["pcb_only_vs_assembled"].append(
                    float((cost_built - cost_pcb_only) / cost_built * 100)
                )
            # PCB + Front Panel vs Assembled: How much cheaper is PCB + Front Panel compared to assembled?
            if cost_pcb_plus_front > 0:
                cost_differences["pcb_plus_front_vs_assembled"].append(
                    float((cost_built - cost_pcb_plus_front) / cost_built * 100)
                )

        # For Kit comparisons, use cost_kit as the baseline.
        if cost_kit > 0:
            # PCB Only vs Kit: How much cheaper is PCB Only compared to the kit cost?
            if cost_pcb_only > 0:
                cost_differences["pcb_only_vs_kit"].append(
                    float((cost_kit - cost_pcb_only) / cost_kit * 100)
                )
            # PCB + Front Panel vs Kit: How much cheaper is PCB + Front Panel compared to the kit cost?
            if cost_pcb_plus_front > 0:
                cost_differences["pcb_plus_front_vs_kit"].append(
                    float((cost_kit - cost_pcb_plus_front) / cost_kit * 100)
                )

    # Compute median and average savings safely
    def compute_stats(values):
        values = list(filter(None, values))  # Remove None values
        return {
            "average_savings": round(sum(values) / len(values), 2) if values else "N/A",
            "median_savings": round(statistics.median(values), 2) if values else "N/A",
        }

    diy_savings_stats = {
        "pcb_only_vs_assembled": compute_stats(
            cost_differences["pcb_only_vs_assembled"]
        ),
        "pcb_plus_front_vs_assembled": compute_stats(
            cost_differences["pcb_plus_front_vs_assembled"]
        ),
        "pcb_only_vs_kit": compute_stats(cost_differences["pcb_only_vs_kit"]),
        "pcb_plus_front_vs_kit": compute_stats(
            cost_differences["pcb_plus_front_vs_kit"]
        ),
    }

    context = {
        "user": request.user,
        "projects": project_data,
        "project_count": project_count,
        "component_count": component_count_display,
        "manufacturer_count": manufacturer_count,
        "blog_posts": blog_data,
        "diy_savings_stats": diy_savings_stats,
    }

    return render(request, "pages/home.html", context)
