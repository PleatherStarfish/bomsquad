from shopping_list.models import UserShoppingList
from rest_framework import serializers


class UserShoppingListSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserShoppingList
        fields = "__all__"
