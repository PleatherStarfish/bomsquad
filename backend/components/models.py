import re
from djmoney.models.fields import MoneyField
from django.db import models
from django.core.exceptions import ValidationError
from django.core.cache import cache
from core.models import BaseModel
from django.urls import reverse
from django.db.models import F
from mptt.models import MPTTModel, TreeForeignKey
from django_editorjs_fields import EditorJsTextField
from django.utils.functional import cached_property


import uuid

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


class Types(BaseModel):
    id = models.UUIDField(primary_key=True, editable=False, default=uuid.uuid4)
    name = models.CharField(max_length=255, unique=True)
    notes = models.TextField(blank=True)

    class Meta:
        verbose_name_plural = "Types"
        ordering = ["name"]

    def __str__(self):
        return f"{self.name}"


class ComponentSupplier(BaseModel):
    id = models.UUIDField(primary_key=True, editable=False, default=uuid.uuid4)
    name = models.CharField(max_length=255)
    short_name = models.CharField(max_length=30)
    url = models.URLField(max_length=255)

    class Meta:
        verbose_name_plural = "Component Suppliers"

    def __str__(self):
        return self.name


class ComponentManufacturer(BaseModel):
    id = models.UUIDField(primary_key=True, editable=False, default=uuid.uuid4)
    name = models.CharField(max_length=255, unique=True)

    class Meta:
        verbose_name_plural = "Component Manufacturers"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Component(BaseModel):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    ]

    id = models.UUIDField(primary_key=True, editable=False, default=uuid.uuid4)
    description = models.CharField(max_length=255, blank=True)
    # vernacular_name = models.CharField(max_length=50, blank=True)
    manufacturer = models.ForeignKey(
        ComponentManufacturer, blank=True, null=True, on_delete=models.PROTECT
    )
    manufacturer_part_no = models.CharField(max_length=100, blank=True)
    manufacturer_link = models.URLField(blank=True, null=False)
    mounting_style = models.CharField(choices=MOUNTING_STYLE, max_length=50, blank=True)
    type = models.ForeignKey(Types, on_delete=models.PROTECT)
    category = TreeForeignKey(
        "Category",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="components",
        help_text="Category to which this component belongs.",
    )
    size = models.ForeignKey(
        "SizeStandard",
        blank=True,
        null=True,
        on_delete=models.PROTECT,
        related_name="components",
        help_text="Size standard for the component.",
    )
    ohms = models.FloatField(
        blank=True,
        null=True,
        help_text="If the component type involves resistance, this value MUST be set.",
    )
    ohms_unit = models.CharField(
        max_length=2,
        choices=OHMS_UNITS,
        blank=True,
        help_text="If the component type involves resistance, this value MUST be set.",
    )
    farads = models.FloatField(
        blank=True,
        null=True,
        help_text="If the component type involves capacitance, this value MUST be set.",
    )
    farads_unit = models.CharField(
        max_length=2,
        choices=FARAD_UNITS,
        blank=True,
        help_text="If the component type involves capacitance, this value MUST be set.",
    )
    voltage_rating = models.CharField(max_length=24, null=True, blank=True)
    current_rating = models.CharField(max_length=24, null=True, blank=True)
    wattage = models.CharField(max_length=24, null=True, blank=True)
    forward_voltage = models.CharField(
        max_length=24,
        blank=True,
        null=True,
        help_text="The forward voltage drop of the component.",
    )
    max_forward_current = models.CharField(
        max_length=24,
        blank=True,
        null=True,
        help_text="The average forward current over a full cycle of an AC signal.",
    )
    tolerance = models.CharField(
        max_length=24,
        blank=True,
        null=True,
    )

    # Potentiometer-specific fields
    POT_MOUNTING_TYPE_CHOICES = [
        ("PCB Mount", "PCB Mount"),
        ("Panel Mount", "Panel Mount"),
        ("Solder Lug", "Solder Lug"),
    ]

    POT_SHAFT_TYPE_CHOICES = [
        ("Smooth", "Smooth"),
        ("Knurled", "Knurled"),
        ("D-Shaft", "D-Shaft"),
    ]

    POT_SHAFT_MATERIAL_CHOICES = [
        ("Plastic", "Plastic"),
        ("Metal", "Metal"),
    ]

    POT_TAPER_CHOICES = [
        ("Linear", "Linear (B)"),
        ("Logarithmic", "Logarithmic (A)"),
        ("Reverse Logarithmic", "Reverse Logarithmic (C)"),
        ("Custom", "Custom (S, W, etc.)"),
    ]

    POT_ANGLE_CHOICES = [
        ("Straight", "Straight"),
        ("Right-Angle", "Right-Angle"),
        ("Right-Angle-Long", "Right-Angle-Long"),
    ]

    pot_mounting_type = models.CharField(
        max_length=20, choices=POT_MOUNTING_TYPE_CHOICES, blank=True, null=True
    )

    pot_shaft_type = models.CharField(
        max_length=20, choices=POT_SHAFT_TYPE_CHOICES, blank=True, null=True
    )

    pot_split_shaft = models.BooleanField(
        default=False,
        help_text="Indicates whether the shaft is split (adjustable width).",
    )

    pot_shaft_diameter = models.CharField(
        max_length=10,
        blank=True,
        null=True,
        help_text="Shaft diameter (e.g., '6mm' or '1/4in.')",
    )

    pot_shaft_length = models.CharField(
        max_length=10,
        blank=True,
        null=True,
        help_text="Shaft length (e.g., '15mm' or '0.75in.')",
    )

    pot_shaft_material = models.CharField(
        max_length=10,
        choices=POT_SHAFT_MATERIAL_CHOICES,
        blank=True,
        null=True,
        help_text="Material of the shaft (Plastic or Metal).",
    )

    pot_taper = models.CharField(
        max_length=25, choices=POT_TAPER_CHOICES, blank=True, null=True
    )

    pot_angle_type = models.CharField(
        max_length=20, choices=POT_ANGLE_CHOICES, blank=True, null=True
    )

    pot_gangs = models.PositiveIntegerField(
        default=1, help_text="Number of gangs (e.g., Single, Dual)"
    )

    pot_base_width = models.CharField(
        max_length=10,
        blank=True,
        null=True,
        help_text="Potentiometer base width (e.g., '9mm', '16mm', '24mm').",
    )

    discontinued = models.BooleanField(default=False)
    notes = models.TextField(blank=True)
    editor_content = EditorJsTextField(
        null=True,
        blank=True,
    )
    submitted_by = models.ForeignKey(
        "accounts.CustomUser",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text="User who submitted this component, if user-submitted.",
    )
    user_submitted_status = models.CharField(
        max_length=10, choices=STATUS_CHOICES, default="approved"
    )
    allow_comments = models.BooleanField("allow comments", default=True)

    @cached_property
    def octopart_url(self):
        """
        Generate and cache the Octopart URL if manufacturer_part_no is defined.
        """
        if self.manufacturer_part_no:
            return f"https://octopart.com/search?q={self.manufacturer_part_no}"
        return None

    def save(self, *args, **kwargs):
        """
        Override the save method to automatically generate the description
        field before saving the model.
        """
        current_user = kwargs.pop("current_user", None)
        if (
            self._state.adding
            and not self.submitted_by
            and self.user_submitted_status != "approved"
        ):
            if current_user and not current_user.is_staff:
                self.submitted_by = current_user

        if not self._state.adding:  # Ensure this is not a new object
            previous_instance = Component.objects.get(pk=self.pk)
            if (
                previous_instance.user_submitted_status == "pending"
                and self.user_submitted_status == "approved"
            ):
                # Update all related supplier items to approved
                self.supplier_items.update(user_submitted_status="approved")

        if not self.description:
            self.description = self.generate_description()

        super().save(*args, **kwargs)

    def generate_description(self):
        """
        Generate a structured and logical description for the Component,
        prioritizing key attributes while ensuring clarity.
        """
        description = []

        # Potentiometer Standardized Representation (e.g., A100K, B500K)
        standardized_resistance = None
        if (
            self.type.name == "Potentiometer"
            and self.ohms is not None
            and self.ohms_unit
            and self.pot_taper
        ):
            # Map pot_taper to the correct letter
            taper_mapping = {
                "Linear": "B",
                "Logarithmic": "A",
                "Reverse Logarithmic": "C",
                "Custom": "W",
            }
            taper_letter = taper_mapping.get(self.pot_taper, "B")

            # Format resistance value with proper notation
            if self.ohms_unit == "Ω":  # Ohms, usually uncommon in potentiometers
                value_str = f"{int(self.ohms)}"
            elif self.ohms_unit == "kΩ":  # Kilo-ohms
                value_str = f"{int(self.ohms)}K"
            elif self.ohms_unit == "MΩ":  # Mega-ohms
                value_str = f"{int(self.ohms)}M"
            else:
                value_str = f"{int(self.ohms)}{self.ohms_unit}"  # Fallback case

            # Generate standardized potentiometer description (e.g., A100K, B10K, C1M)
            standardized_resistance = f"{taper_letter}{value_str}"
            description.append(standardized_resistance)

        # Potentiometer-specific description

        if self.type.name == "Potentiometer":
            pot_core_details = []

            # Shaft type
            if self.pot_shaft_type:
                pot_core_details.append(
                    self.pot_shaft_type
                )  # e.g., "Knurled", "D-Shaft"

            # Shaft material (only mention if not Metal)
            if self.pot_shaft_material and self.pot_shaft_material != "Metal":
                pot_core_details.append(self.pot_shaft_material + " Shaft")
            else:
                pot_core_details.append("Shaft")  # Default to "Shaft" if metal

            # Ensure "Straight" and similar values are correctly placed
            if self.pot_angle_type:
                if self.pot_angle_type == "Straight":
                    pot_core_details.insert(0, "Straight")  # Place at the start
                else:
                    pot_core_details.append(self.pot_angle_type)  # e.g., "Right-Angle"

            if self.pot_gangs and self.pot_gangs > 1:
                pot_core_details.append(f"{self.pot_gangs}-gang")

            # Ensure "with PCB Mount" is correctly placed
            if self.pot_mounting_type:
                pot_core_details.append(f"with {self.pot_mounting_type}")

            if self.pot_split_shaft:
                pot_core_details.append("Split Shaft")

            if pot_core_details:
                description.append(
                    " ".join(pot_core_details)
                )  # Use words instead of '|'

            # Collect size-related details for parentheses
            pot_size_details = []

            if self.pot_shaft_diameter:
                pot_size_details.append(f"{self.pot_shaft_diameter} diameter")

            if self.pot_shaft_length:
                pot_size_details.append(f"{self.pot_shaft_length} length")

            if self.pot_base_width:
                pot_size_details.append(f"{self.pot_base_width} base")

            if pot_size_details:
                description.append(
                    f"({', '.join(pot_size_details)})"
                )  # Size details in parentheses

        # General Component Description (Resistors, Capacitors, etc.)
        else:
            if self.ohms and self.ohms_unit:
                description.append(f"{self.ohms}{self.ohms_unit} Resistor")
            elif self.farads and self.farads_unit:
                description.append(f"{self.farads}{self.farads_unit} Capacitor")

            if self.type:
                description.append(self.type.name)

            if self.category:
                description.append(self.category.name)

            if self.size:
                description.append(self.size.name)

            # Include mounting style
            if self.mounting_style:
                description.append(
                    "(Through Hole)" if self.mounting_style == "th" else "(SMT)"
                )

            # Include wattage if available
            if self.wattage:
                description.append(
                    f"{self.wattage}W" if "W" in self.wattage else f"{self.wattage}W"
                )

            # Include tolerance if available
            if self.tolerance:
                description.append(f"{self.tolerance} Tolerance")

        # Add manufacturer and part number if available
        if self.manufacturer and self.manufacturer_part_no:
            description.append(
                f"by {self.manufacturer.name} (Part No: {self.manufacturer_part_no})"
            )
        elif self.manufacturer:
            description.append(f"by {self.manufacturer.name}")
        elif self.manufacturer_part_no:
            description.append(f"(Part No: {self.manufacturer_part_no})")

        return " ".join(description).strip()

    class Meta:
        verbose_name_plural = "Components"
        ordering = ["type", "mounting_style", "description"]

    def __str__(self):
        type_name = self.type.name if self.type else "Unknown Type"

        # Merge supplier names with their corresponding item numbers
        supplier_items = [
            f"{supplier} ({item_no})"
            for supplier, item_no in self.supplier_items.values_list(
                "supplier__name", "supplier_item_no"
            )
        ]
        supplier_items_str = (
            ", ".join(supplier_items)
            if supplier_items
            else "No Suppliers or Item Numbers"
        )

        mounting_style = self.mounting_style or "No Mounting Style"

        if type_name == "Potentiometers":
            return f"{self.description or 'No Description'} | {mounting_style} | {type_name} (Suppliers: {supplier_items_str})"
        elif type_name == "Resistors":
            return f"{self.ohms or 'No Ohms'} | {mounting_style} | {self.ohms_unit or 'No Unit'} | {type_name} (Suppliers: {supplier_items_str})"
        elif type_name == "Capacitors":
            return f"{self.farads or 'No Farads'} | {mounting_style} | {self.farads_unit or 'No Unit'} | {type_name} (Suppliers: {supplier_items_str})"
        else:
            return f"{self.description or 'No Description'} | {mounting_style} | {type_name} (Suppliers: {supplier_items_str})"

    def clean(self, *args, **kwargs):
        if self.type.name == "Potentiometer":
            if not self.ohms or not self.ohms_unit:
                raise ValidationError("Potentiometers must have an Ohm value and unit.")

            if not self.pot_taper:
                raise ValidationError(
                    "Potentiometers must have a taper (Linear, Log, etc.)."
                )

            if self.pot_base_width and not re.match(r"^\d+mm$", self.pot_base_width):
                raise ValidationError(
                    "Potentiometer base width must be a valid format (e.g., '9mm', '16mm')."
                )

            if self.pot_shaft_diameter and not re.match(
                r"^\d+(\.\d+)?(mm|in\.)$", self.pot_shaft_diameter
            ):
                raise ValidationError(
                    "Invalid shaft diameter format. Use '6mm' or '1/4in.'."
                )

            if self.pot_shaft_length and not re.match(
                r"^\d+(\.\d+)?(mm|in\.)$", self.pot_shaft_length
            ):
                raise ValidationError(
                    "Invalid shaft length format. Use '15mm' or '0.75in.'."
                )

            # Split Shaft must be false if Shaft Type is "Solid Shaft" or "D-Shaft"
            if self.pot_split_shaft and self.pot_shaft_type in [
                "Solid Shaft",
                "D-Shaft",
            ]:
                raise ValidationError("Solid Shaft and D-Shaft cannot be split.")

            if self.pot_shaft_material and self.pot_shaft_material not in [
                "Plastic",
                "Metal",
            ]:
                raise ValidationError(
                    "Potentiometer shaft material must be either 'Plastic' or 'Metal'."
                )

        if self.type.name == "Resistor":
            if not self.ohms or not self.ohms_unit:
                raise ValidationError(
                    "If this component is a resistor, you must set the Ohm value and unit."
                )
            if self.farads or self.farads_unit:
                raise ValidationError(
                    "Farad value and unit must not be set for resistors."
                )
        if self.type.name == "Capacitor":
            if not self.farads or not self.farads_unit:
                raise ValidationError(
                    "If this component is a capacitor, you must set the Farad value and unit."
                )
            if self.ohms or self.ohms_unit:
                raise ValidationError(
                    "Ohm value and unit must not be set for capacitors."
                )
        if self.type.name == "Potentiometer":
            if not self.ohms or not self.ohms_unit:
                raise ValidationError(
                    "If this component is a potentiometer, you must set the Ohm value and unit."
                )
            if self.farads or self.farads_unit:
                raise ValidationError(
                    "Farad value and unit must not be set for potentiometers."
                )

        # if not self.supplier_items.exists():
        #     raise ValidationError(
        #         "A component must have at least one associated ComponentSupplierItem."
        #     )

        current_user = kwargs.pop("current_user", None)

        # If the current user is an admin, short-circuit validation
        if current_user and current_user.is_staff:
            return

        # Validate user-submitted components
        if not self.submitted_by and self.user_submitted_status != "approved":
            raise ValidationError(
                "A user-submitted component with a non-approved status must have a `submitted_by` user."
            )

        if self.user_submitted_status == "pending" and not self.submitted_by:
            raise ValidationError("Pending components must have a `submitted_by` user.")

        if self.user_submitted_status not in ["approved", "rejected", "pending"]:
            raise ValidationError(
                f"Invalid `user_submitted_status`: {self.user_submitted_status}. Allowed values are: pending, approved, rejected."
            )

    def get_absolute_url(self):
        return reverse(
            "component-detail",
            kwargs={
                "component_id": self.pk,
            },
        )

    @classmethod
    def get_mounting_styles(cls):
        return [{"value": choice[0], "label": choice[1]} for choice in MOUNTING_STYLE]

    @classmethod
    def get_unique_values(cls, field_name, value_type):
        """
        Get unique values for a specific field without caching.
        """
        # Use distinct on the specific field
        field_values = list(
            cls.objects.order_by(field_name)
            .values_list(field_name, flat=True)
            .distinct()
        )
        # Filter None values and apply the value_type conversion
        field_values = [value_type(val) for val in field_values if val is not None]

        return field_values

    @classmethod
    def get_unique_ohms_or_farads_values(cls, field1, field2):
        """
        Retrieve unique (value, unit) combinations for ohms or farads,
        sorted by unit priority and numeric value.
        """
        # Define the unit order
        UNIT_ORDER = {
            "Ω": 1,
            "kΩ": 2,
            "MΩ": 3,
            "pF": 1,
            "nF": 2,
            "μF": 3,
            "mF": 4,
        }

        # Fetch unique combinations of value and unit, excluding invalid rows
        queryset = (
            cls.objects.filter(
                **{f"{field1}__isnull": False, f"{field2}__isnull": False}
            )
            .exclude(**{field2: ""})
            .values_list(field1, field2)
            .distinct()
        )

        # Use a set to remove duplicates
        unique_values = set(queryset)

        # Sort the queryset by unit order and value
        sorted_values = sorted(
            unique_values,
            key=lambda item: (
                UNIT_ORDER.get(item[1], 1000),  # Prioritize unit order
                float(item[0]),  # Then sort by numeric value
            ),
        )

        # Format the sorted values into strings
        return [f"{float(value)} {unit}" for value, unit in sorted_values]


class ComponentSupplierItem(BaseModel):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    ]

    id = models.UUIDField(primary_key=True, editable=False, default=uuid.uuid4)
    component = models.ForeignKey(
        Component, related_name="supplier_items", on_delete=models.CASCADE
    )
    supplier = models.ForeignKey(
        ComponentSupplier, related_name="component_items", on_delete=models.PROTECT
    )
    supplier_item_no = models.CharField(
        max_length=100,
        null=True,
        blank=True,
        unique=True,
        help_text="Supplier's item number for this component.",
    )
    price = MoneyField(
        max_digits=10, decimal_places=2, default_currency="USD", blank=True, null=True
    )
    unit_price = models.GeneratedField(
        expression=F("price") / F("pcs"),
        output_field=models.DecimalField(max_digits=8, decimal_places=2),
        db_persist=True,  # Persisting in the database for querying and indexing
    )
    pcs = models.IntegerField(
        default=1, help_text="Number of items purchased per price (if sold in a set)."
    )
    link = models.URLField(
        blank=True, null=True, help_text="URL to the supplier's page for the component."
    )
    submitted_by = models.ForeignKey(
        "accounts.CustomUser",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text="User who submitted this component, if user-submitted.",
    )
    user_submitted_status = models.CharField(
        max_length=10, choices=STATUS_CHOICES, default="approved"
    )

    class Meta:
        unique_together = [
            ("component", "supplier"),
            ("supplier", "supplier_item_no"),
        ]

    def save(self, *args, **kwargs):
        """
        Override the save method to automatically generate the description
        field before saving the model.
        """
        current_user = kwargs.pop("current_user", None)
        if (
            self._state.adding
            and not self.submitted_by
            and self.user_submitted_status != "approved"
        ):
            if current_user and not current_user.is_staff:
                self.submitted_by = current_user

        super().save(*args, **kwargs)


class SizeStandard(MPTTModel):
    """
    Represents a size standard for electronic components.
    """

    name = models.CharField(
        max_length=50,
        unique=True,
        help_text="Unique name of the size standard (e.g., 0805, SOIC14).",
    )
    parent = TreeForeignKey(
        "self",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="children",
        help_text="Parent category for this category.",
    )
    description = models.TextField(
        blank=True,
        help_text="Detailed description of the size standard.",
    )

    class MPTTMeta:
        order_insertion_by = ["name"]

    class Meta:
        verbose_name = "Size Standard"
        verbose_name_plural = "Size Standards"
        ordering = ["name"]

    def __str__(self):
        return self.name

    def get_full_path(self):
        """
        Returns the full nested path of the size standard as a string.
        """
        ancestors = self.get_ancestors(include_self=True)
        return " > ".join(ancestor.name for ancestor in ancestors)

    def to_nested_dict(self):
        """
        Converts the size standard and its descendants to a nested dictionary structure.
        """
        return {
            "label": self.name,
            "value": self.id,
            "options": [child.to_nested_dict() for child in self.get_children()],
        }


class Category(MPTTModel):
    """
    Represents a hierarchical structure for categorizing components.
    """

    name = models.CharField(max_length=255)
    parent = TreeForeignKey(
        "self",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="children",
        help_text="Parent category for this category.",
    )

    class MPTTMeta:
        order_insertion_by = ["name"]

    class Meta:
        verbose_name = "Category"
        verbose_name_plural = "Categories"
        ordering = ["name"]

    def __str__(self):
        return self.name

    def get_full_path(self):
        """
        Returns the full nested path of the category as a string.
        """
        ancestors = self.get_ancestors(include_self=True)
        return " > ".join(ancestor.name for ancestor in ancestors)

    def to_nested_dict(self):
        """
        Converts the category and its descendants to a nested dictionary structure.
        """
        return {
            "label": self.name,
            "value": self.id,
            "options": [child.to_nested_dict() for child in self.get_children()],
        }
