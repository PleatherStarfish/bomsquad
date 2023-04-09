from rest_framework import serializers
from modules.models import BuiltModules, WantToBuildModules, Module, ModuleBomListItem


class ModuleSerializer(serializers.ModelSerializer):
    manufacturer = serializers.StringRelatedField()

    class Meta:
        model = Module
        fields = (
            "name",
            "slug",
            "manufacturer",
            "version",
            "description",
            "image",
            "manufacturer_page_link",
            "bom_link",
            "manual_link",
            "modulargrid_link",
        )


class BuiltModuleSerializer(serializers.ModelSerializer):
    module = ModuleSerializer()

    class Meta:
        model = BuiltModules
        fields = (
            "id",
            "module",
        )


class WantTooBuildModuleSerializer(serializers.ModelSerializer):
    module = ModuleSerializer()

    class Meta:
        model = WantToBuildModules
        fields = (
            "id",
            "module",
        )


class ModuleBomListItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModuleBomListItem
        fields = "__all__"
