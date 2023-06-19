from rest_framework import serializers
from accounts.models import CustomUser, UserNotes


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
        ]


class UserHistorySerializer(serializers.ModelSerializer):
    history = serializers.SerializerMethodField()

    def get_history(self, obj):
        # Sort the history items by timestamp in descending order
        sorted_history = sorted(obj.history, key=lambda x: x["timestamp"], reverse=True)
        return sorted_history

    class Meta:
        model = CustomUser
        fields = ["history"]


class UserNotesSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserNotes
        fields = ["note"]
