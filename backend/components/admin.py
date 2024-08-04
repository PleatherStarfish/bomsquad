from django.contrib import admin
from components.models import Component, ComponentSupplier, ComponentManufacturer, Types
from core.admin import BaseAdmin


class ComponentAdmin(BaseAdmin):
    model = Component
    fieldsets = (
        (
            None,
            {
                "fields": (
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
                    "discontinued",
                    "notes",
                    "link",
                    "allow_comments",
                )
            },
        ),
        (
            "Resistor Specific Fields",
            {"classes": ("collapse",), "fields": ("ohms", "ohms_unit")},
        ),
        (
            "Capacitor Specific Fields",
            {"classes": ("collapse",), "fields": ("farads", "farads_unit")},
        ),
        (
            "Diode Specific Fields",
            {
                "classes": ("collapse",),
                "fields": (
                    "forward_current",
                    "forward_voltage",
                    "forward_surge_current",
                    "forward_current_avg_rectified",
                ),
            },
        ),
        (
            "Ratings",
            {
                "classes": ("collapse",),
                "fields": ("voltage_rating", "current_rating", "tolerance"),
            },
        ),
    )


class TypesAdmin(BaseAdmin):
    model = Types


class ComponentSupplierAdmin(BaseAdmin):
    model = ComponentSupplier


class ComponentManufacturerAdmin(BaseAdmin):
    model = ComponentManufacturer


# Register your models here.
admin.site.register(Component, ComponentAdmin)
admin.site.register(Types, TypesAdmin)
admin.site.register(ComponentSupplier, ComponentSupplierAdmin)
admin.site.register(ComponentManufacturer, ComponentManufacturerAdmin)
