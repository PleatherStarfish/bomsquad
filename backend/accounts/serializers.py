from rest_framework import serializers
from accounts.models import CustomUser, UserNotes
import json


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "email",
            "default_currency",
            "premium_until",
            "is_premium",
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
