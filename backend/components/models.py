from djmoney.models.fields import MoneyField
from django.db import models
from django.core.exceptions import ValidationError
from django.core.cache import cache
from core.models import BaseModel
from django.urls import reverse
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
    id = models.UUIDField(primary_key=True, editable=False, default=uuid.uuid4)
    description = models.CharField(max_length=255)
    manufacturer = models.ForeignKey(
        ComponentManufacturer, blank=True, null=True, on_delete=models.PROTECT
    )
    manufacturer_part_no = models.CharField(max_length=100, blank=True)
    mounting_style = models.CharField(choices=MOUNTING_STYLE, max_length=50, blank=True)
    supplier = models.ForeignKey(
        ComponentSupplier, blank=True, null=True, on_delete=models.PROTECT
    )
    supplier_item_no = models.CharField(
        max_length=100,
        unique=True,
        null=True,
        blank=True,
        help_text="This must be set unless 'supplier_has_no_item_no' is checked.",
    )
    supplier_has_no_item_no = models.BooleanField(default=False)
    type = models.ForeignKey(Types, on_delete=models.PROTECT)
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
    voltage_rating = models.CharField(max_length=6, blank=True)
    current_rating = models.CharField(max_length=6, blank=True)
    forward_current = models.CharField(
        max_length=6,
        blank=True,
        null=True,
        help_text="The maximum forward current of the component.",
    )
    forward_voltage = models.CharField(
        max_length=6,
        blank=True,
        null=True,
        help_text="The forward voltage drop of the component.",
    )
    forward_surge_current = models.CharField(
        max_length=6,
        blank=True,
        null=True,
        help_text="The maximum forward surge current of the component.",
    )
    forward_current_avg_rectified = models.CharField(
        max_length=6,
        blank=True,
        null=True,
        help_text="The average forward current over a full cycle of an AC signal.",
    )
    tolerance = models.CharField(
        max_length=6,
        blank=True,
        null=True,
    )
    price = MoneyField(
        max_digits=4,
        decimal_places=2,
        default_currency="USD",
        blank=False,
        default=0,
    )
    pcs = models.IntegerField(
        default=1,
        help_text="The number of component that are purchased per price (if they are sold in a set). Defaults to 1.",
    )
    discontinued = models.BooleanField(default=False)
    notes = models.TextField(blank=True)
    link = models.URLField(blank=False)
    allow_comments = models.BooleanField("allow comments", default=True)

    class Meta:
        verbose_name_plural = "Components"
        ordering = ["type", "mounting_style", "description"]

    def __str__(self):
        if self.type.name == "Potentiometers":
            return f"{self.description} | {self.mounting_style} | {self.type.name} ({self.supplier.name} {self.supplier_item_no})"
        elif self.type.name == "Resistors":
            return f"{self.ohms} | {self.mounting_style} | {self.ohms_unit} | {self.type} ({self.supplier.name} {self.supplier_item_no})"
        elif self.type.name == "Capacitors":
            return f"{self.farads} | {self.mounting_style} | {self.farads_unit} | {self.type} ({self.supplier.name} {self.supplier_item_no})"
        else:
            return f"{self.description} | {self.mounting_style} | {self.type.name} ({self.supplier.name} {self.supplier_item_no})"

    def clean(self):
        if not self.supplier_has_no_item_no and not self.supplier_item_no:
            raise ValidationError(
                "Supplier item number is required if 'supplier has no item number' is False."
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
        elif self.type.name == "Capacitor":
            if not self.farads or not self.farads_unit:
                raise ValidationError(
                    "If this component is a capacitor, you must set the Farad value and unit."
                )
            if self.ohms or self.ohms_unit:
                raise ValidationError(
                    "Ohm value and unit must not be set for capacitors."
                )
        elif self.type.name == "Potentiometer":
            if not self.ohms or not self.ohms_unit:
                raise ValidationError(
                    "If this component is a potentiometer, you must set the Ohm value and unit."
                )
            if self.farads or self.farads_unit:
                raise ValidationError(
                    "Farad value and unit must not be set for potentiometers."
                )
        elif self.type.name == "Diode":
            if not (
                self.forward_current
                or self.forward_voltage
                or self.forward_surge_current
                or self.forward_current_avg_rectified
            ):
                raise ValidationError(
                    "If this component is a diode, you must set at least one of the forward current, forward voltage, forward surge current, or average forward current rectified."
                )

        # Validation to ensure diode-specific fields are not set for non-diodes and non-LEDs
        if self.type.name not in ["Diode", "Light-emitting diode (LED)"]:
            if (
                self.forward_current
                or self.forward_voltage
                or self.forward_surge_current
                or self.forward_current_avg_rectified
            ):
                raise ValidationError(
                    "Forward current, forward voltage, forward surge current, and average forward current rectified must not be set for non-diodes and non-LEDs."
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
        cache_key = f"unique_{field_name}_values"
        field_values = cache.get(cache_key)

        if field_values is None:
            field_values = list(
                cls.objects.values_list(field_name, flat=True).distinct()
            )
            field_values = [value_type(val) for val in field_values if val is not None]
            cache.set(cache_key, field_values, timeout=60 * 60)

        return field_values

    @classmethod
    def get_unique_ohms_or_farads_values(cls, field1, field2):
        values = cache.get(f"unique_{field1}_{field2}_values")
        if values is None:
            queryset = (
                cls.objects.values_list(field1, field2)
                .order_by(field2, field1)
                .distinct()
                .exclude(**{field1: None, field2: None})
            )
            values = [
                f"{float(val[0])} {val[1]}"
                for val in queryset
                if val[0] is not None and val[1] is not None
            ]
            cache.set(f"unique_{field1}_{field2}_values", values, timeout=60 * 60)
        return values
