from modules.serializers import ModuleSerializer
from components.serializers import ComponentSerializer
from shopping_list.models import UserShoppingList, UserShoppingListSaved
from rest_framework import serializers


class UserShoppingListSerializer(serializers.ModelSerializer):
    module = ModuleSerializer(allow_null=True)
    module_name = serializers.CharField(source="module.name", allow_null=True)
    component = ComponentSerializer(allow_null=False)

    class Meta:
        model = UserShoppingList
        fields = "__all__"


class UserShoppingListSavedSerializer(serializers.ModelSerializer):
    module = ModuleSerializer(allow_null=True)
    module_name = serializers.CharField(source="module.name", allow_null=True)
    component = ComponentSerializer(allow_null=False)

    class Meta:
        model = UserShoppingListSaved
        fields = "__all__"
