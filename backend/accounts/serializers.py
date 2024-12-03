from rest_framework import serializers
from accounts.models import CustomUser, UserNotes
from shopping_list.models import UserShoppingList
from allauth.account.admin import EmailAddress
from core.views import get_exchange_rate
import json


class EmailAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailAddress
        fields = ["email", "verified", "primary"]


class UserSerializer(serializers.ModelSerializer):
    unique_module_ids = serializers.SerializerMethodField()
    emails = EmailAddressSerializer(
        source="emailaddress_set", many=True, read_only=True
    )
    email = serializers.SerializerMethodField()

    def get_email(self, obj):
        """
        Retrieve the primary email address from the EmailAddress model.
        """
        primary_email = EmailAddress.objects.filter(user=obj, primary=True).first()
        return primary_email.email if primary_email else None

    def get_unique_module_ids(self, obj):
        try:
            modules = (
                UserShoppingList.objects.filter(user=obj)
                .exclude(module__isnull=True)
                .values_list("module", flat=True)
                .distinct()
            )
            return list(modules)
        except Exception:
            return []

    class Meta:
        model = CustomUser
        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "email",
            "emails",
            "date_joined",
            "default_currency",
            "end_of_premium_display_date",
            "is_premium",
            "unique_module_ids",
        ]


class UserHistorySerializer(serializers.ModelSerializer):
    history = serializers.SerializerMethodField()

    def get_history(self, obj):
        history_list = (
            json.loads(obj.history) if isinstance(obj.history, str) else obj.history
        )
        # Sort the history items by timestamp in descending order
        sorted_history = sorted(
            history_list, key=lambda x: x["timestamp"], reverse=True
        )
        return sorted_history

    class Meta:
        model = CustomUser
        fields = ["history"]


class UserNotesSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserNotes
        fields = [
            "id",
            "note",
            "want_to_build_module",
            "built_module",
            "user_shopping_list_saved",
        ]
        extra_kwargs = {
            "want_to_build_module": {"required": False},
            "built_module": {"required": False},
            "user_shopping_list_saved": {"required": False},
        }


class UserCurrencySerializer(serializers.Serializer):
    default_currency = serializers.CharField()
    currency_name = serializers.CharField()
    exchange_rate = serializers.FloatField()
