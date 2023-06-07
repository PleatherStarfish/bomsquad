from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    CURRENCIES = [
        ("AUD", "Australian Dollar"),
        ("AED", "United Arab Emirates Dirham"),
        ("BRL", "Brazilian Real"),
        ("CAD", "Canadian Dollar"),
        ("CHF", "Swiss Franc"),
        ("CNH", "Chinese Yuan"),
        ("CZK", "Czech Koruna"),
        ("DKK", "Danish Krone"),
        ("EUR", "Euro"),
        ("GBP", "British Pound"),
        ("HKD", "Hong Kong Dollar"),
        ("HUF", "Hungarian Forint"),
        ("IDR", "Indonesian Rupiah"),
        ("INR", "Indian Rupee"),
        ("ILS", "Israeli New Shekel"),
        ("JPY", "Japanese Yen"),
        ("KRW", "South Korean Won"),
        ("MXN", "Mexican Peso"),
        ("MYR", "Malaysian Ringgit"),
        ("NOK", "Norwegian Krone"),
        ("NZD", "New Zealand Dollar"),
        ("PHP", "Philippine Peso"),
        ("PLN", "Polish Złoty"),
        ("QAR", "Qatari Riyal"),
        ("RUB", "Russian Ruble"),
        ("SAR", "Saudi Riyal"),
        ("SEK", "Swedish Krona"),
        ("SGD", "Singapore Dollar"),
        ("THB", "Thai Baht"),
        ("TRY", "Turkish Lira"),
        ("USD", "US Dollar"),
        ("ZAR", "South African Rand"),
    ]
    username = models.CharField(max_length=30, unique=True, blank=True, null=True)
    default_currency = models.CharField(
        choices=CURRENCIES, default="USD", max_length=3, null=True, blank=True
    )
    history = models.JSONField(default=list, blank=True)

    def __str__(self):
        return self.email
