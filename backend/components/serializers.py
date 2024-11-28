from modules.serializers import (
    ManufacturerSerializer,
    SupplierSerializer,
    TypeSerializer,
)
from components.models import (
    Component,
    SizeStandard,
    Category,
    ComponentSupplierItem,
    ComponentSupplier,
    Types,
    ComponentManufacturer,
)
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


class AddComponentDropdownOptionsSerializer:
    @staticmethod
    def get_data():
        """
        Fetches and returns dropdown data for types, manufacturers, suppliers,
        categories, and sizes as dictionaries with 'id' and 'name' keys.
        """
        return {
            "types": Types.objects.values("id", "name"),
            "manufacturers": ComponentManufacturer.objects.values("id", "name"),
            "suppliers": ComponentSupplier.objects.values("id", "short_name"),
        }


OHMS_UNITS = (
    ("Ω", "Ω"),
    ("kΩ", "kΩ"),
    ("MΩ", "MΩ"),
)

FARAD_UNITS = (
    ("mF", "mF"),
    ("μF", "μF"),
    ("nF", "nF"),
    ("pF", "pF"),
)

MOUNTING_STYLE = [
    ("smt", "Surface Mount (SMT)"),
    ("th", "Through Hole"),
]

CURRENCIES = [
    ("USD", "US Dollar"),
    ("EUR", "Euro"),
    ("JPY", "Japanese Yen"),
    ("GBP", "British Pound"),
    ("AUD", "Australian Dollar"),
    ("CAD", "Canadian Dollar"),
    ("CHF", "Swiss Franc"),
    ("CNY", "Chinese Yuan"),
    ("HKD", "Hong Kong Dollar"),
    ("NZD", "New Zealand Dollar"),
    ("SEK", "Swedish Krona"),
    ("KRW", "South Korean Won"),
    ("SGD", "Singapore Dollar"),
    ("NOK", "Norwegian Krone"),
    ("INR", "Indian Rupee"),
]


class CreateComponentSerializer(serializers.ModelSerializer):
    pcs = serializers.IntegerField(required=False, default=1)

    class Meta:
        model = Component
        fields = "__all__"

    def save(self, **kwargs):
        # Set voltage_rating to None if not provided or empty
        self.validated_data["voltage_rating"] = (
            self.validated_data.get("voltage_rating") or None
        )
        return super().save(**kwargs)


class CreateComponentSupplierItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComponentSupplierItem
        fields = "__all__"

    def validate_component(self, value):
        if not value:
            raise serializers.ValidationError("Component field is required.")
        return value
