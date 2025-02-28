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
from core.views import get_exchange_rate


class ComponentSupplierItemSerializer(serializers.ModelSerializer):
    supplier = SupplierSerializer()
    price = serializers.SerializerMethodField()
    unit_price = serializers.SerializerMethodField()

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

    def get_price(self, obj):
        """
        Normalize the price to the user's currency as a decimal.
        """
        if obj.price is None:
            return None

        target_currency = self.get_target_currency()
        stored_currency = obj.price.currency.code
        amount = obj.price.amount

        return self.normalize_currency(amount, stored_currency, target_currency)

    def get_unit_price(self, obj):
        """
        Normalize the unit price to the user's currency as a decimal.
        """
        if obj.unit_price is None:
            return None

        target_currency = self.get_target_currency()
        stored_currency = obj.price.currency.code  # Use the price's currency
        amount = obj.unit_price

        return self.normalize_currency(amount, stored_currency, target_currency)

    def get_target_currency(self):
        """
        Determine the target currency based on the user's preferences or request parameters.
        """
        request = self.context.get("request")
        if not request:
            return "USD"  # Default currency if no request context is available

        if request.user.is_authenticated:
            return getattr(request.user, "default_currency", "USD")
        return request.query_params.get("currency", "USD")

    def normalize_currency(self, amount, stored_currency, target_currency):
        """
        Normalize an amount from the stored currency to the target currency.
        """
        if stored_currency == target_currency:
            # No conversion needed
            return round(float(amount), 2)

        try:
            # Convert directly from the stored currency to the target currency
            exchange_rate = get_exchange_rate(stored_currency, target_currency)
            normalized_amount = float(amount) * float(exchange_rate)

            return round(normalized_amount, 2)
        except Exception as e:
            raise serializers.ValidationError(f"Error normalizing currency: {e}")


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
    type = TypeSerializer()
    category = NestedCategorySerializer()
    size = NestedSizeStandardSerializer()
    supplier_items = ComponentSupplierItemSerializer(many=True, read_only=True)
    qualities = serializers.SerializerMethodField()
    link = serializers.SerializerMethodField()

    class Meta:
        model = Component
        exclude = ["allow_comments", "user_submitted_status", "submitted_by"]

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

    def get_link(self, obj):
        """
        Return the Octopart URL if available.
        """
        return obj.octopart_url


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

    class Meta:
        model = Component
        fields = "__all__"

    def validate(self, data):
        # Check for duplicate manufacturer part number
        manufacturer_part_no = data.get("manufacturer_part_no")
        if (
            manufacturer_part_no
            and Component.objects.filter(
                manufacturer_part_no=manufacturer_part_no
            ).exists()
        ):
            raise serializers.ValidationError(
                {
                    "manufacturer_part_no": "This manufacturer part number already exists."
                }
            )

        return data

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

    def __init__(self, *args, **kwargs):
        self.existing_supplier_items = kwargs.pop("existing_supplier_items", [])
        super().__init__(*args, **kwargs)

    def validate(self, data):
        # Check for duplicate supplier item numbers in the database
        supplier_item_no = data.get("supplier_item_no")
        supplier = data.get("supplier")

        if supplier_item_no and supplier:
            # Check for duplicates in the existing supplier items from the request
            if any(
                item["supplier_item_no"] == supplier_item_no
                and item["supplier"] == supplier
                for item in self.existing_supplier_items
            ):
                raise serializers.ValidationError(
                    {
                        "supplier_item_no": f"Supplier item number '{supplier_item_no}' for supplier '{supplier}' is duplicated in the input data."
                    }
                )

            # Check for duplicates in the database
            if ComponentSupplierItem.objects.filter(
                supplier_item_no=supplier_item_no, supplier=supplier
            ).exists():
                raise serializers.ValidationError(
                    {
                        "supplier_item_no": f"Supplier item number '{supplier_item_no}' for supplier '{supplier}' already exists in the database."
                    }
                )

        return data

    def validate_component(self, value):
        if not value:
            raise serializers.ValidationError("Component field is required.")
        return value
