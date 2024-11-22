from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin
from core.admin import BaseAdmin

from .forms import CustomUserCreationForm, CustomUserChangeForm
from .models import CustomUser, UserNotes, KofiPayment, ExchangeRate


class CustomUserAdmin(UserAdmin):
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    model = CustomUser
    list_display = ("username", "email", "is_staff", "is_premium_display")
    fieldsets = UserAdmin.fieldsets + (
        (
            "Premium Information",
            {
                "fields": (
                    "is_premium_display",
                    "premium_admin_override",
                    "premium_until",
                    "premium_until_via_kofi",
                    "premium_until_via_patreon",
                    "default_currency",
                )
            },
        ),
        (("History"), {"fields": ("history",)}),
    )

    def is_premium_display(self, obj):
        return obj.is_premium

    readonly_fields = ("is_premium_display",)  # Make it read-only


class UserNotesAdmin(BaseAdmin):
    model = UserNotes


class ExchangeRateAdmin(BaseAdmin):
    list_display = ("base_currency", "target_currency", "rate", "last_updated")
    readonly_fields = ("last_updated",)


admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(UserNotes, UserNotesAdmin)
admin.site.register(KofiPayment)
admin.site.register(ExchangeRate, ExchangeRateAdmin)
