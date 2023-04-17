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

    class Meta:
        model = Component
        fields = "__all__"
