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
    order = models.PositiveSmallIntegerField(unique=False)
    notes = models.TextField(blank=True)

    class Meta:
        verbose_name_plural = "Types"
        ordering = ["order"]

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
    supplier_item_no = models.CharField(max_length=100, blank=False, unique=True)
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
    voltage_rating = models.CharField(max_length=3, blank=True)
    tolerance = models.CharField(max_length=3, blank=True)
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

    def __str__(self):
        if self.type.name == "Potentiometers":
            return f"{self.description} -- {self.type.name} -- ({self.supplier.name} {self.supplier_item_no})"
        elif self.type.name == "Resistors":
            return f"{self.ohms} -- {self.ohms_unit} -- {self.type} -- ({self.supplier.name} {self.supplier_item_no})"
        elif self.type.name == "Capacitors":
            return f"{self.farads} -- {self.farads_unit} -- {self.type} -- ({self.supplier.name} {self.supplier_item_no})"
        else:
            return f"{self.description} -- {self.type.name} -- ({self.supplier.name} {self.supplier_item_no})"

    def clean(self):
        if self.type.name == "Resistors":
            if not self.ohms or not self.ohms_unit:
                raise ValidationError(
                    "If this component is a resistor, you must set the Ohm value and unit."
                )
            if self.farads or self.farads_unit:
                raise ValidationError(
                    "Farad value and unit must not be set for resistors."
                )
        elif self.type.name == "Capacitors":
            if not self.farads or not self.farads_unit:
                raise ValidationError(
                    "If this component is a capacitor, you must set the Farad value and unit."
                )
            if self.ohms or self.ohms_unit:
                raise ValidationError(
                    "Ohm value and unit must not be set for capacitors."
                )
        elif self.type.name == "Potentiometers":
            if not self.ohms or not self.ohms_unit:
                raise ValidationError(
                    "If this component is a potentiometer, you must set the Ohm value and unit."
                )
            if self.farads or self.farads_unit:
                raise ValidationError(
                    "Farad value and unit must not be set for resistors."
                )

    def get_absolute_url(self):
        return reverse(
            "component-detail",
            kwargs={
                "pk": self.pk,
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
