from modules.serializers import ModuleSerializer
from shopping_list.models import UserShoppingList
from rest_framework import serializers


class UserShoppingListSerializer(serializers.ModelSerializer):
    module = ModuleSerializer(allow_null=True)
    module_name = serializers.CharField(source="module.name", allow_null=True)

    class Meta:
        model = UserShoppingList
        fields = "__all__"
