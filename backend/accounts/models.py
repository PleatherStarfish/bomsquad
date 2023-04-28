from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    CURRENCIES = [
        ("AUD", "Australian Dollar"),
        ("CAD", "Canadian Dollar"),
        ("CHF", "Swiss Franc"),
        ("CNH", "Chinese Yuan"),
        ("EUR", "Euro"),
        ("GBP", "British Pound"),
        ("HKD", "Hong Kong Dollar"),
        ("INR", "Indian Rupee"),
        ("JPY", "Japanese Yen"),
        ("NZD", "New Zealand Dollar"),
        ("USD", "US Dollar"),
    ]
    username = models.CharField(
        max_length=30, unique=True, blank=True, null=True)
    default_currency = models.CharField(
        choices=CURRENCIES, default="USD", max_length=3, null=True, blank=True
    )
    history = models.JSONField(default=list, blank=True)

    def __str__(self):
        return self.email
