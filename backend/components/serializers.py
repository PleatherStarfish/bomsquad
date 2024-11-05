from modules.serializers import (
    ManufacturerSerializer,
    SupplierSerializer,
    TypeSerializer,
)
from components.models import Component
from rest_framework import serializers


class ComponentSerializer(serializers.ModelSerializer):
    manufacturer = ManufacturerSerializer()
    supplier = SupplierSerializer()
    type = TypeSerializer()
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
            "price",
            "pcs",
            "unit_price",
            "discontinued",
            "notes",
            "link",
            "allow_comments",
        ]
