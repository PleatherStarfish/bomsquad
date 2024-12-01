from components.models import ComponentManufacturer, ComponentSupplier, Types
from rest_framework import serializers
from modules.models import (
    BuiltModules,
    WantToBuildModules,
    Module,
    ModuleBomListItem,
    Manufacturer,
    PcbVersion,
    ModuleBomListComponentForItemRating,
)


class ManufacturerSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComponentManufacturer
        fields = ["name"]


class ModuleManufacturerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Manufacturer
        fields = ["name", "link"]


class ModuleSerializer(serializers.ModelSerializer):
    manufacturer_name = serializers.CharField(source="manufacturer.name")
    manufacturer_slug = serializers.CharField(source="manufacturer.slug")
    manufacturer = ModuleManufacturerSerializer()

    class Meta:
        model = Module
        fields = "__all__"


class BuiltModuleSerializer(serializers.ModelSerializer):
    module = ModuleSerializer()

    class Meta:
        model = BuiltModules
        fields = "__all__"


class WantTooBuildModuleSerializer(serializers.ModelSerializer):
    module = ModuleSerializer()

    class Meta:
        model = WantToBuildModules
        fields = "__all__"


class TypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Types
        fields = ["id", "name"]


class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComponentSupplier
        fields = ["name", "short_name", "url"]


class PCBVersionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PcbVersion
        fields = ["id", "module", "version", "order"]


class ModuleBomListItemSerializer(serializers.ModelSerializer):
    sum_of_user_options_from_inventory = serializers.IntegerField(required=False)
    sum_of_user_options_from_shopping_list = serializers.IntegerField(required=False)
    pcb_version = PCBVersionSerializer(many=True)
    type = TypeSerializer()
    bom_link = serializers.URLField(source="module.bom_link", read_only=True)

    class Meta:
        model = ModuleBomListItem
        fields = "__all__"


class ModuleBomListComponentForItemRatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModuleBomListComponentForItemRating
        fields = ["module_bom_list_item", "component", "rating"]
        extra_kwargs = {"rating": {"min_value": 1, "max_value": 5}}
