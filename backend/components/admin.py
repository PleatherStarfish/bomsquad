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
                    "type",
                    "size",
                    "category",
                    "discontinued",
                    "notes",
                    "allow_comments",
                    "editor_content",
                )
            },
        ),
        (
            "Submission Details",
            {
                "classes": ("collapse",),  # Collapsible section for admin usability
                "fields": ("submitted_by", "user_submitted_status"),
            },
        ),
        (
            "Resistor Specific Fields",
            {"classes": ("collapse",), "fields": ("ohms", "ohms_unit", "wattage")},
        ),
        (
            "Capacitor Specific Fields",
            {
                "classes": ("collapse",),
                "fields": (
                    "farads",
                    "farads_unit",
                    "footprint_length",
                    "footprint_width",
                    "component_height",
                    "pin_spacing",
                ),
            },
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
            "Potentiometer Specific Fields",
            {
                "classes": ("collapse",),
                "fields": (
                    "pot_taper",
                    "pot_mounting_type",
                    "pot_angle_type",
                    "pot_gangs",
                    "pot_shaft_type",
                    "pot_shaft_material",
                    "pot_split_shaft",
                    "pot_shaft_diameter",
                    "pot_shaft_length",
                    "pot_base_width",
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
        "size",
        "category",
        "submitted_by",
        "user_submitted_status",
    )

    # Add filters for relevant fields
    list_filter = (
        "mounting_style",
        "type",
        "discontinued",
        "user_submitted_status",
    )

    # Add search fields for easy lookup
    search_fields = (
        "description",
        "manufacturer__name",
        "supplier_items__supplier_item_no",
        "type__name",
        "manufacturer_part_no",
    )

    ordering = ("-datetime_updated",)

    inlines = [ComponentSupplierItemInline]

    def lookup_allowed(self, key, value=None):
        return True

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.prefetch_related("type", "submitted_by")


class TypesAdmin(BaseAdmin):
    model = Types


class ComponentSupplierAdmin(BaseAdmin):
    model = ComponentSupplier


class ComponentManufacturerAdmin(BaseAdmin):
    model = ComponentManufacturer
    search_fields = ["name"]


class CategoryAdmin(ImportExportModelAdmin, DjangoMpttAdmin):
    model = Category


class SizeStandardAdmin(ImportExportModelAdmin, DjangoMpttAdmin):
    model = SizeStandard


class ComponentSupplierItemInline(admin.TabularInline):
    model = ComponentSupplierItem
    extra = 1
    fields = (
        "supplier",
        "supplier_item_no",
        "price",
        "pcs",
        "link",
    )
    readonly_fields = ()
    verbose_name = "Supplier Item"
    verbose_name_plural = "Supplier Items"

    def get_formset(self, request, obj=None, **kwargs):
        formset = super().get_formset(request, obj, **kwargs)
        for form in formset.forms:
            if "pcs" in form.fields:
                form.fields["pcs"].initial = 1
            if "price" in form.fields:
                form.fields["price"].initial = 0.00
        return formset


class ComponentSupplierItemAdmin(ImportExportModelAdmin):
    model = ComponentSupplierItem
    list_display = ("supplier", "supplier_item_no", "price", "pcs", "link", "component")
    list_filter = ("supplier", "user_submitted_status")
    search_fields = ("supplier_item_no", "component__description", "supplier__name")
    ordering = ("-datetime_updated",)


# Register your models here.
admin.site.register(Component, ComponentAdmin)
admin.site.register(Types, TypesAdmin)
admin.site.register(ComponentSupplier, ComponentSupplierAdmin)
admin.site.register(ComponentManufacturer, ComponentManufacturerAdmin)
admin.site.register(Category, CategoryAdmin)
admin.site.register(SizeStandard, SizeStandardAdmin)
admin.site.register(ComponentSupplierItem, ComponentSupplierItemAdmin)
