from django.contrib import admin
from components.models import (
    Component,
    ComponentSupplier,
    ComponentManufacturer,
    Types,
    ComponentSupplierItem,
    Category,
    SizeStandard,
)
from core.admin import BaseAdmin
from import_export.admin import ImportExportModelAdmin
from django_mptt_admin.admin import DjangoMpttAdmin


class ComponentSupplierItemInline(admin.TabularInline):
    model = ComponentSupplierItem
    extra = 1  # Number of blank rows for adding new items
    fields = (
        "supplier",
        "supplier_item_no",
        "price",
        "pcs",
        "link",
    )
    readonly_fields = ()  # Specify any read-only fields here if needed
    verbose_name = "Supplier Item"
    verbose_name_plural = "Supplier Items"


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
                    "supplier_has_no_item_no",
                    "type",
                    "size",
                    "category",
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
            {"classes": ("collapse",), "fields": ("ohms", "ohms_unit", "wattage")},
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
                    "forward_voltage",
                    "max_forward_current",
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
    list_display = (
        "description",
        "mounting_style",
        "supplier",
        "supplier_item_no",
        "size",
        "category",
    )

    # Add filters for relevant fields
    list_filter = ("mounting_style", "supplier", "type", "discontinued")

    # Add search fields for easy lookup
    search_fields = (
        "description",
        "manufacturer__name",
        "supplier__name",
        "type__name",
        "manufacturer_part_no",
        "supplier_item_no",
    )

    inlines = [ComponentSupplierItemInline]

    # Option 1: Override lookup_allowed to allow all lookups (use with caution)
    def lookup_allowed(self, key, value=None):
        return True


class TypesAdmin(BaseAdmin):
    model = Types


class ComponentSupplierAdmin(BaseAdmin):
    model = ComponentSupplier


class ComponentManufacturerAdmin(BaseAdmin):
    model = ComponentManufacturer


class CategoryAdmin(ImportExportModelAdmin, DjangoMpttAdmin):
    model = Category


class SizeStandardAdmin(ImportExportModelAdmin, DjangoMpttAdmin):
    model = SizeStandard


# Register your models here.
admin.site.register(Component, ComponentAdmin)
admin.site.register(Types, TypesAdmin)
admin.site.register(ComponentSupplier, ComponentSupplierAdmin)
admin.site.register(ComponentManufacturer, ComponentManufacturerAdmin)
admin.site.register(Category, CategoryAdmin)
admin.site.register(SizeStandard, SizeStandardAdmin)
