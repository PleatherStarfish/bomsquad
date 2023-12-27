from rest_framework import serializers
from accounts.models import CustomUser, UserNotes
from shopping_list.models import UserShoppingList
from allauth.account.admin import EmailAddress
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
        fields = ["note"]
