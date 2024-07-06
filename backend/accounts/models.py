from django.contrib.auth.models import AbstractUser
from django.db import models
from core.models import BaseModel
from django.utils import timezone

import uuid


class KofiPayment(models.Model):
    kofi_transaction_id = models.UUIDField(primary_key=True)
    email = models.EmailField()
    tier_name = models.TextField(null=True, blank=True)
    timestamp = models.DateTimeField(null=True, blank=True)
    type = models.TextField(null=True, blank=True)
    is_public = models.BooleanField(blank=True, default=False)
    from_name = models.TextField(null=True, blank=True)
    message = models.TextField(null=True, blank=True)
    amount = models.CharField(max_length=6, null=True, blank=True)
    url = models.URLField(null=True, blank=True)
    currency = models.CharField(max_length=6, null=True, blank=True)
    is_first_subscription_payment = models.BooleanField(blank=True, default=False)


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
    premium_admin_override = models.BooleanField(
        default=False, help_text="Admin override to make the user premium arbitrarily."
    )
    premium_until = models.DateField(
        null=True,
        blank=True,
        help_text="Premium expiry date. If subscribed through direct payment, such as Stripe, this is the date when the subscription ends if not renewed.",
    )
    premium_until_via_kofi = models.DateField(
        null=True,
        blank=True,
        help_text="Premium expiry date. If subscribed through Ko-fi, is the date when the Ko-fi subscription ends if not renewed.",
    )
    premium_until_via_patreon = models.DateField(
        null=True,
        blank=True,
        help_text="Premium expiry date. If subscribed through Patreon, is the date when the Ko-fi subscription ends if not renewed.",
    )

    def __str__(self):
        return self.email

    @property
    def is_premium(self):
        """
        Checks if the user is currently premium. Set to true for all users currently.
        """
        return True

        # if self.premium_admin_override:
        #     return True

        # now = timezone.now().date()

        # if self.premium_until and self.premium_until >= now:
        #     return True

        # if self.premium_until_via_kofi and self.premium_until_via_kofi >= now:
        #     return True

        # if self.premium_until_via_patreon and self.premium_until_via_patreon >= now:
        #     return True

        # return False

    @property
    def end_of_premium_display_date(self):
        """
        Returns the date when the user's premium expires in a human-readable format.
        """
        date = None
        if self.premium_until:
            date = self.premium_until
        elif self.premium_until_via_kofi:
            date = self.premium_until_via_kofi
        elif self.premium_until_via_patreon:
            date = self.premium_until_via_patreon

        if date:
            return date.strftime("%B %d, %Y")
        else:
            return None


class UserNotes(BaseModel):
    id = models.UUIDField(primary_key=True, editable=False, default=uuid.uuid4)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    note = models.TextField()

    def __str__(self):
        return self.user.email
