from django.contrib.auth.models import AbstractUser
from django.db import models
from core.models import BaseModel
from django.utils import timezone

from datetime import timedelta
import uuid


class KofiPayment(models.Model):
    kofi_transaction_id = models.UUIDField(primary_key=True)
    email = models.EmailField()
    tier_name = models.CharField(max_length=255, null=True, blank=True)
    timestamp = models.DateTimeField(null=True, blank=True)


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
    id = models.BigAutoField(auto_created=True, primary_key=True)
    username = models.CharField(max_length=30, unique=True, blank=True)
    default_currency = models.CharField(
        choices=CURRENCIES, default="USD", max_length=3, blank=True
    )
    history = models.JSONField(default=list, blank=True)
    premium_until = models.DateField(
        null=True,
        blank=True,
        help_text="Premium expiry date. Is null if not premium or premium via Patreon.",
    )

    def __str__(self):
        return self.email

    @property
    def is_premium(self):
        """
        Checks if the user is currently premium.
        """
        if self.premium_until and self.premium_until >= timezone.now().date():
            return True

        # Check if the user's email appears in the KofiPayment model within the last 31 days
        thirty_one_days_ago = timezone.now() - timedelta(days=31)
        has_recent_kofi_payment = KofiPayment.objects.filter(
            email=self.email, timestamp__gte=thirty_one_days_ago
        ).exists()

        if has_recent_kofi_payment:
            return True

        return False


class UserNotes(BaseModel):
    id = models.UUIDField(primary_key=True, editable=False, default=uuid.uuid4)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    note = models.TextField()

    def __str__(self):
        return self.user.email
