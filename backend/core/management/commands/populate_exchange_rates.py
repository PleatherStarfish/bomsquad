from django.core.management.base import BaseCommand
from django.utils.timezone import now
from accounts.models import ExchangeRate
from decimal import Decimal

SUPPORTED_CURRENCIES = [
    "USD",
    "EUR",
    "JPY",
    "GBP",
    "AUD",
    "CAD",
    "CHF",
    "CNY",
    "HKD",
    "NZD",
    "SEK",
    "KRW",
    "SGD",
    "NOK",
    "INR",
]

BASE_CURRENCIES = ["USD", "EUR", "GBP"]

# Hardcoded exchange rates for demonstration purposes
HARDCODED_RATES = {
    "USD": {
        "EUR": 0.91,
        "JPY": 144.85,
        "GBP": 0.79,
        "AUD": 1.55,
        "CAD": 1.36,
        "CHF": 0.89,
        "CNY": 7.3,
        "HKD": 7.8,
        "NZD": 1.67,
        "SEK": 10.95,
        "KRW": 1300.5,
        "SGD": 1.37,
        "NOK": 11.01,
        "INR": 83.23,
    },
    "EUR": {
        "USD": 1.1,
        "JPY": 159.15,
        "GBP": 0.87,
        "AUD": 1.7,
        "CAD": 1.5,
        "CHF": 0.98,
        "CNY": 8.0,
        "HKD": 8.6,
        "NZD": 1.84,
        "SEK": 12.03,
        "KRW": 1428.5,
        "SGD": 1.5,
        "NOK": 12.11,
        "INR": 91.23,
    },
    "GBP": {
        "USD": 1.26,
        "EUR": 1.15,
        "JPY": 182.75,
        "AUD": 1.96,
        "CAD": 1.72,
        "CHF": 1.13,
        "CNY": 9.22,
        "HKD": 9.95,
        "NZD": 2.13,
        "SEK": 14.05,
        "KRW": 1670.3,
        "SGD": 1.8,
        "NOK": 14.56,
        "INR": 109.56,
    },
}


class Command(BaseCommand):
    help = "Populate the ExchangeRate table with hardcoded rates to and from USD, EUR, and GBP for all supported currencies."

    def handle(self, *args, **kwargs):
        total_rates_added = 0
        total_rates_updated = 0

        for base_currency in BASE_CURRENCIES:
            for target_currency in SUPPORTED_CURRENCIES:
                if base_currency == target_currency:
                    continue

                # Fetch the hardcoded rate
                rate = HARDCODED_RATES.get(base_currency, {}).get(target_currency)
                if rate is None:
                    self.stderr.write(
                        self.style.WARNING(
                            f"Rate missing for {base_currency} -> {target_currency}. Skipping."
                        )
                    )
                    continue

                # Check if the rate already exists in the database
                exchange_rate, created = ExchangeRate.objects.update_or_create(
                    base_currency=base_currency,
                    target_currency=target_currency,
                    defaults={"rate": Decimal(rate), "last_updated": now()},
                )

                if created:
                    total_rates_added += 1
                else:
                    total_rates_updated += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Exchange rates population completed: {total_rates_added} added, {total_rates_updated} updated."
            )
        )
