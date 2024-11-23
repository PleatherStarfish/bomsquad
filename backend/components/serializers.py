from modules.serializers import (
    ManufacturerSerializer,
    SupplierSerializer,
    TypeSerializer,
)
from components.models import Component, SizeStandard, Category, ComponentSupplierItem
from rest_framework import serializers


class ComponentSupplierItemSerializer(serializers.ModelSerializer):
    supplier = SupplierSerializer()
    unit_price = serializers.DecimalField(
        max_digits=10, decimal_places=2, read_only=True
    )

    class Meta:
        model = ComponentSupplierItem
        fields = [
            "id",
            "supplier",
            "supplier_item_no",
            "price",
            "unit_price",
            "pcs",
            "link",
        ]


class NestedCategorySerializer(serializers.ModelSerializer):
    nested = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ["id", "name", "nested"]

    def get_nested(self, obj):
        """
        Returns the nested structure for the category.
        """
        return obj.to_nested_dict()


class NestedSizeStandardSerializer(serializers.ModelSerializer):
    nested = serializers.SerializerMethodField()

    class Meta:
        model = SizeStandard
        fields = ["id", "name", "nested"]

    def get_nested(self, obj):
        """
        Returns the nested structure for the size standard.
        """
        return obj.to_nested_dict()


class ComponentSerializer(serializers.ModelSerializer):
    manufacturer = ManufacturerSerializer()
    supplier = SupplierSerializer()
    type = TypeSerializer()
    category = NestedCategorySerializer()
    size = NestedSizeStandardSerializer()
    unit_price = serializers.DecimalField(
        max_digits=10, decimal_places=2, read_only=True
    )
    supplier_items = ComponentSupplierItemSerializer(many=True, read_only=True)

    # Add a custom field for combined qualities
    qualities = serializers.SerializerMethodField()

    class Meta:
        model = Component
        fields = [
            "id",
            "description",
            "manufacturer",
            "manufacturer_part_no",
            "mounting_style",
            "supplier",
            "supplier_item_no",
            "type",
            "category",
            "size",
            "price",
            "pcs",
            "unit_price",
            "discontinued",
            "notes",
            "link",
            "allow_comments",
            "supplier_items",
            "qualities",  # Include the custom field
        ]

    def get_qualities(self, obj):
        """
        Combine various component qualities into a single string.
        """
        qualities = [
            f"{obj.ohms} {obj.ohms_unit}" if obj.ohms and obj.ohms_unit else None,
            (
                f"{obj.farads} {obj.farads_unit}"
                if obj.farads and obj.farads_unit
                else None
            ),
            f"Voltage: {obj.voltage_rating}" if obj.voltage_rating else None,
            f"Tolerance: {obj.tolerance}" if obj.tolerance else None,
        ]
        return ", ".join(filter(None, qualities)) or "N/A"
