from djmoney.models.fields import MoneyField
from django.db import models
from django.core.exceptions import ValidationError
from django.core.cache import cache
from core.models import BaseModel
from django.urls import reverse
from django.db.models import F
from mptt.models import MPTTModel, TreeForeignKey


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
    manufacturer = models.ForeignKey(
        ComponentManufacturer, blank=True, null=True, on_delete=models.PROTECT
    )
    manufacturer_part_no = models.CharField(max_length=100, blank=True)
    manufacturer_link = models.URLField(blank=True, null=False)
    mounting_style = models.CharField(choices=MOUNTING_STYLE, max_length=50, blank=True)
    supplier = models.ForeignKey(
        ComponentSupplier,
        blank=True,
        null=True,
        on_delete=models.PROTECT,
        help_text="Deprecated",
    )
    supplier_item_no = models.CharField(
        max_length=100,
        unique=True,
        null=True,
        blank=True,
        help_text="Deprecated - This must be set unless 'supplier_has_no_item_no' is checked.",
    )
    supplier_has_no_item_no = models.BooleanField(default=False, help_text="Deprecated")
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
    ohms = models.DecimalField(
        blank=True,
        null=True,
        decimal_places=1,
        max_digits=6,
        help_text="If the component type involves resistance, this value MUST be set.",
    )
    ohms_unit = models.CharField(
        max_length=2,
        choices=OHMS_UNITS,
        blank=True,
        help_text="If the component type involves resistance, this value MUST be set.",
    )
    farads = models.DecimalField(
        blank=True,
        null=True,
        decimal_places=1,
        max_digits=6,
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
    price = MoneyField(
        max_digits=4,
        decimal_places=2,
        default_currency="USD",
        blank=False,
        default=0,
        help_text="Deprecated",
    )
    pcs = models.IntegerField(
        default=1,
        help_text="Deprecated - The number of component that are purchased per price (if they are sold in a set). Defaults to 1.",
    )
    unit_price = models.GeneratedField(
        expression=F("price") / F("pcs"),
        output_field=models.DecimalField(max_digits=8, decimal_places=2),
        db_persist=True,  # Persisting in the database for querying and indexing
    )
    discontinued = models.BooleanField(default=False)
    notes = models.TextField(blank=True)
    link = models.URLField(blank=True, help_text="Deprecated")
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

    def save(self, *args, **kwargs):
        """
        Override the save method to automatically generate the description
        field before saving the model.
        """
        current_user = kwargs.pop("current_user", None)
        if not self.submitted_by and self.user_submitted_status != "approved":
            if current_user and not current_user.is_staff:
                self.submitted_by = current_user

        if not self.description:
            self.description = self.generate_description()

        super().save(*args, **kwargs)

    def generate_description(self):
        """
        Generate a short and logical description for the Component,
        including wattage, tolerance, and mounting style if set.
        """
        description = ""

        # Prioritize value fields
        if self.ohms and self.ohms_unit:
            description = f"{self.ohms}{self.ohms_unit} Resistor"

        elif self.farads and self.farads_unit:
            description = f"{self.farads}{self.farads_unit} Capacitor"

        # Include mounting style
        if self.mounting_style:
            description += (
                f" {'(through hole)' if self.mounting_style == 'th' else '(SMT)'}"
            )

        elif self.type:
            description = f"{self.type.name}"

        # Include wattage if available
        if self.wattage:
            if not self.wattage.endswith("W"):
                description += f", {self.wattage}W"
            else:
                description += f", {self.wattage}"

        # Include tolerance if available
        if self.tolerance:
            description += f", {self.tolerance} tolerance"

        # Add manufacturer and part number if available
        if self.manufacturer and self.manufacturer_part_no:
            description += (
                f" by {self.manufacturer.name} (Part No: {self.manufacturer_part_no})"
            )

        # Add manufacturer if part number is unavailable
        elif self.manufacturer:
            description += f" by {self.manufacturer.name}"

        # Fallback to part number only if no other info is available
        elif self.manufacturer_part_no:
            description += f" (Part No: {self.manufacturer_part_no})"

        return description.strip()

    class Meta:
        verbose_name_plural = "Components"
        ordering = ["type", "mounting_style", "description"]

    def __str__(self):
        type_name = self.type.name if self.type else "Unknown Type"
        supplier_name = self.supplier.name if self.supplier else "Unknown Supplier"
        supplier_item_no = (
            self.supplier_item_no if self.supplier_item_no else "No Item Number"
        )
        mounting_style = self.mounting_style or "No Mounting Style"

        if type_name == "Potentiometers":
            return f"{self.description or 'No Description'} | {mounting_style} | {type_name} ({supplier_name} {supplier_item_no})"
        elif type_name == "Resistors":
            return f"{self.ohms or 'No Ohms'} | {mounting_style} | {self.ohms_unit or 'No Unit'} | {type_name} ({supplier_name} {supplier_item_no})"
        elif type_name == "Capacitors":
            return f"{self.farads or 'No Farads'} | {mounting_style} | {self.farads_unit or 'No Unit'} | {type_name} ({supplier_name} {supplier_item_no})"
        else:
            return f"{self.description or 'No Description'} | {mounting_style} | {type_name} ({supplier_name} {supplier_item_no})"

    def clean(self, *args, **kwargs):
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

    class Meta:
        unique_together = ("component", "supplier")


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
