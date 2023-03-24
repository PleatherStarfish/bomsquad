from rest_framework import serializers
from modules.models import Module
from inventory.models import UserInventory, Component


class ModuleSerializer(serializers.ModelSerializer):
    manufacturer_name = serializers.CharField(source="manufacturer.name")

    class Meta:
        model = Module
        fields = [
            "id",
            "name",
            "manufacturer",
            "manufacturer_name",
            "version",
            "description",
            "image",
            "manufacturer_page_link",
            "bom_link",
            "manual_link",
            "modulargrid_link",
            "slug",
            "date_updated",
        ]


class ComponentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Component
        fields = "__all__"


class UserInventorySerializer(serializers.ModelSerializer):
    component = ComponentSerializer()

    class Meta:
        model = UserInventory
        fields = ("component", "quantity", "location")
