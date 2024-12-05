from django.contrib.auth.models import AbstractUser
from django.db import models
from core.models import BaseModel
from modules.models import WantToBuildModules, BuiltModules
from shopping_list.models import UserShoppingListSaved
from django.core.exceptions import ValidationError
from django.utils.timezone import now


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
    cookie_consent_status = models.CharField(
        max_length=10, choices=[("allow", "Allow"), ("deny", "Deny")], default="deny"
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
        # date = None
        # if self.premium_until:
        #     date = self.premium_until
        # elif self.premium_until_via_kofi:
        #     date = self.premium_until_via_kofi
        # elif self.premium_until_via_patreon:
        #     date = self.premium_until_via_patreon

        # if date:
        #     return date.strftime("%B %d, %Y")
        # else:
        return None


class UserNotes(BaseModel):
    id = models.UUIDField(primary_key=True, editable=False, default=uuid.uuid4)
    note = models.TextField()
    want_to_build_module = models.ForeignKey(
        WantToBuildModules,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="notes_want_to_build",
    )
    built_module = models.ForeignKey(
        BuiltModules,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="notes_built",
    )
    user_shopping_list_saved = models.ForeignKey(
        "shopping_list.UserShoppingListSaved",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="notes_user_shopping_list_saved",
    )

    def __str__(self):
        if self.want_to_build_module:
            return f"Note by {self.want_to_build_module.user.email}"
        elif self.built_module:
            return f"Note by {self.built_module.user.email}"
        elif self.user_shopping_list_saved:
            return f"Note by {self.user_shopping_list_saved.user.email}"
        return "Note with no associated module"

    def clean(self):
        associations = [
            self.want_to_build_module,
            self.built_module,
            self.user_shopping_list_saved,
        ]
        if sum(bool(assoc) for assoc in associations) > 1:
            raise ValidationError(
                "Note can be related to only one of WantToBuildModule, BuiltModule, or UserShoppingListSaved."
            )
        if not any(associations):
            raise ValidationError(
                "Note must be related to either WantToBuildModule, BuiltModule, or UserShoppingListSaved."
            )

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["want_to_build_module"], name="unique_want_to_build_module"
            ),
            models.UniqueConstraint(
                fields=["built_module"], name="unique_built_module"
            ),
            models.UniqueConstraint(
                fields=["user_shopping_list_saved"],
                name="unique_user_shopping_list_saved",
            ),
        ]


class ExchangeRate(models.Model):
    base_currency = models.CharField(max_length=3)  # e.g., 'USD'
    target_currency = models.CharField(max_length=3)  # e.g., 'EUR'
    rate = models.DecimalField(max_digits=12, decimal_places=6)  # Exchange rate
    last_updated = models.DateTimeField(default=now)  # Tracks the last update time

    class Meta:
        unique_together = ("base_currency", "target_currency")

    def __str__(self):
        return f"{self.base_currency} -> {self.target_currency}: {self.rate}"
