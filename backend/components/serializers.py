from modules.serializers import (
    ManufacturerSerializer,
    SupplierSerializer,
    TypeSerializer,
)
from components.models import Component, SizeStandard, Category
from rest_framework import serializers


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
        ]
