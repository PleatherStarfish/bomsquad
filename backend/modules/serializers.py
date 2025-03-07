from components.models import (
    Component,
    ComponentManufacturer,
    ComponentSupplier,
    ComponentSupplierItem,
    Types,
)
from rest_framework import serializers
from modules.models import (
    BuiltModules,
    SuggestedComponentForBomListItem,
    WantToBuildModules,
    Module,
    ModuleBomListItem,
    Manufacturer,
    PcbVersion,
    ModuleBomListComponentForItemRating,
)
from djmoney.contrib.django_rest_framework.fields import MoneyField


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


# Only for use as input to SuggestedComponentForBomListItemSerializer
class SupplierItemSerializer(serializers.Serializer):
    currency = serializers.CharField()
    link = serializers.URLField(required=False, allow_blank=True)
    price = serializers.FloatField()
    supplier = serializers.UUIDField()
    supplier_item_no = serializers.CharField()


class ComponentDataSerializer(serializers.Serializer):
    component = serializers.DictField(child=serializers.CharField(allow_null=True))
    supplier_items = SupplierItemSerializer(many=True, required=True)


class SuggestedComponentForBomListItemSerializer(serializers.Serializer):
    module_bom_list_item_id = serializers.UUIDField(required=True)
    component_id = serializers.UUIDField(required=False, allow_null=True)
    component_data = ComponentDataSerializer(required=False)

    def validate(self, data):
        """
        Ensure that either `component_id` or `component_data` is provided, but not both.
        """
        component_id = data.get("component_id", None)
        component_data = data.get("component_data", None)

        # Ensure only one of `component_id` or `component_data` is provided
        if component_id and component_data:
            raise serializers.ValidationError(
                "You cannot provide both 'component_id' and 'component_data'."
            )
        elif not component_id and not component_data:
            raise serializers.ValidationError(
                "You must provide either 'component_id' or 'component_data'."
            )

        return data

    def validate_component_id(self, value):
        """
        Validate the component_id to ensure it is not already associated with the BOM list item.
        """
        module_bom_list_item_id = self.initial_data.get("module_bom_list_item_id")

        # Check if the component exists
        try:
            component = Component.objects.get(id=value)
        except Component.DoesNotExist:
            raise serializers.ValidationError("The specified component does not exist.")

        # Check if the component is already associated with the BOM list item
        try:
            module_bom_list_item = ModuleBomListItem.objects.get(
                id=module_bom_list_item_id
            )
        except ModuleBomListItem.DoesNotExist:
            raise serializers.ValidationError(
                "The specified BOM list item does not exist."
            )

        if component in module_bom_list_item.components_options.all():
            raise serializers.ValidationError(
                "This component is already associated with the BOM list item."
            )

        # Check if the component is already suggested for this BOM list item
        if SuggestedComponentForBomListItem.objects.filter(
            module_bom_list_item_id=module_bom_list_item_id,
            suggested_component=component,
        ).exists():
            raise serializers.ValidationError(
                "This component has already been suggested for the specified BOM list item."
            )

        return value

    def validate_component_data(self, value):
        supplier_items = value["supplier_items"]
        module_bom_list_item_id = self.initial_data.get("module_bom_list_item_id")

        for supplier_item in supplier_items:
            supplier_item_no = supplier_item["supplier_item_no"]
            supplier_id = supplier_item["supplier"]

            if ComponentSupplierItem.objects.filter(
                supplier_item_no=supplier_item_no, supplier_id=supplier_id
            ).exists():
                raise serializers.ValidationError(
                    f"A supplier item with number '{supplier_item_no}' already exists."
                )

        component_data = value["component"]
        potential_duplicate = Component.objects.filter(
            manufacturer=component_data["manufacturer"],
            manufacturer_part_no=component_data["manufacturer_part_no"],
            type_id=component_data["type"],
        ).first()

        if potential_duplicate:
            if SuggestedComponentForBomListItem.objects.filter(
                module_bom_list_item_id=module_bom_list_item_id,
                suggested_component=potential_duplicate,
            ).exists():
                raise serializers.ValidationError(
                    "A similar component has already been suggested for this BOM list item."
                )

        return value


class SimplifiedSupplierItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComponentSupplierItem
        fields = ["supplier_item_no", "price", "link"]


class SimplifiedComponentSerializer(serializers.ModelSerializer):
    supplier_items = SimplifiedSupplierItemSerializer(many=True)
    type = TypeSerializer()

    class Meta:
        model = Component
        fields = [
            "id",
            "description",
            "manufacturer_part_no",
            "type",
            "mounting_style",
            "supplier_items",
        ]


class SuggestedComponentDetailSerializer(serializers.ModelSerializer):
    suggested_component = SimplifiedComponentSerializer()

    class Meta:
        model = SuggestedComponentForBomListItem
        fields = [
            "id",
            "module_bom_list_item",
            "suggested_component",
            "status",
        ]


class CostStatsSerializer(serializers.Serializer):
    low = serializers.DecimalField(max_digits=10, decimal_places=2)
    high = serializers.DecimalField(max_digits=10, decimal_places=2)
    average = serializers.DecimalField(max_digits=10, decimal_places=2)
    median = serializers.DecimalField(max_digits=10, decimal_places=2)


class ModuleCostStatsSerializer(serializers.Serializer):
    module_id = serializers.UUIDField()
    module_name = serializers.CharField()
    overall = CostStatsSerializer()

    cost_built = MoneyField(
        max_digits=10,
        decimal_places=2,
        default_currency="USD",
        required=False,
        allow_null=True,
    )
    cost_built_link = serializers.URLField(required=False, allow_null=True)
    cost_built_third_party = serializers.BooleanField(required=False, allow_null=True)

    cost_pcb_only = MoneyField(
        max_digits=10,
        decimal_places=2,
        default_currency="USD",
        required=False,
        allow_null=True,
    )
    cost_pcb_only_link = serializers.URLField(required=False, allow_null=True)
    cost_pcb_only_third_party = serializers.BooleanField(
        required=False, allow_null=True
    )

    cost_pcb_plus_front = MoneyField(
        max_digits=10,
        decimal_places=2,
        default_currency="USD",
        required=False,
        allow_null=True,
    )
    cost_pcb_plus_front_link = serializers.URLField(required=False, allow_null=True)
    cost_pcb_plus_front_third_party = serializers.BooleanField(
        required=False, allow_null=True
    )

    cost_kit = MoneyField(
        max_digits=10,
        decimal_places=2,
        default_currency="USD",
        required=False,
        allow_null=True,
    )
    cost_kit_link = serializers.URLField(required=False, allow_null=True)
    cost_kit_third_party = serializers.BooleanField(required=False, allow_null=True)

    cost_partial_kit = MoneyField(
        max_digits=10,
        decimal_places=2,
        default_currency="USD",
        required=False,
        allow_null=True,
    )
    cost_partial_kit_link = serializers.URLField(required=False, allow_null=True)
    cost_partial_kit_third_party = serializers.BooleanField(
        required=False, allow_null=True
    )
