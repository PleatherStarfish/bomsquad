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

    def get_unique_module_ids(self, obj):
        """
        Get the IDs of unique modules for the given user in their shopping list.
        """
        modules = (
            UserShoppingList.objects.filter(user=obj)
            .exclude(module__isnull=True)
            .values_list("module", flat=True)
            .distinct()
        )
        return list(modules)

    class Meta:
        model = CustomUser
        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
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

    def to_representation(self, instance):
        """
        Customize the representation of the user's currency data.
        """
        user = self.context.get("request").user
        default_currency = user.default_currency if user.is_authenticated else "USD"
        exchange_rate = 1.0
        currency_name = "US Dollar"

        if user.is_authenticated:
            try:
                exchange_rate = get_exchange_rate(default_currency)
                currency_name = dict(CustomUser.CURRENCIES).get(
                    default_currency, "Unknown Currency"
                )
            except ValueError:
                pass

        return {
            "default_currency": default_currency,
            "currency_name": currency_name,
            "exchange_rate": exchange_rate,
        }
