from components.models import ComponentManufacturer, ComponentSupplier, Types
from components.models import Component
from rest_framework import serializers
from modules.models import (
    BuiltModules,
    WantToBuildModules,
    Module,
    ModuleBomListItem,
)


class ModuleSerializer(serializers.ModelSerializer):
    manufacturer = serializers.StringRelatedField()

    class Meta:
        model = Module
        fields = "__all__"


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


class TypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Types
        fields = ["name"]


class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComponentSupplier
        fields = ["name", "short_name", "url"]


class ManufacturerSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComponentManufacturer
        fields = ["name"]


class ComponentSerializer(serializers.ModelSerializer):
    manufacturer = ManufacturerSerializer()
    supplier = SupplierSerializer()
    type = TypeSerializer()

    class Meta:
        model = Component
        fields = "__all__"


class ModuleBomListItemSerializer(serializers.ModelSerializer):
    sum_of_user_options_from_inventory = serializers.IntegerField()

    class Meta:
        model = ModuleBomListItem
        fields = "__all__"
