from django.contrib import admin
from .models import (
    Manufacturer,
    Module,
    WantToBuildModules,
    BuiltModules,
    ModuleBomListItem,
    ModuleBomListComponentForItemRating,
    PcbVersion,
    Substitution,
    SuggestedComponentForBomListItem,
)
from core.admin import BaseAdmin


class ModuleBomListItemAdmin(BaseAdmin):
    model = ModuleBomListItem
    filter_horizontal = ("components_options", "pcb_version")

    # Display important fields in the list view
    list_display = (
        "description",
        "module",
        "quantity",
        "type",
    )

    # Add filters for relevant fields
    list_filter = ("module", "type", "module__manufacturer__name")

    # Add search fields for easy lookup
    search_fields = (
        "description",
        "module__name",
        "type__name",
        "components_options__name",
        "pcb_version__version",
    )

    def lookup_allowed(self, key, value=None):
        return True


class ManufacturerAdmin(BaseAdmin):
    model = Manufacturer


class ModuleAdmin(BaseAdmin):
    list_display = ("name", "manufacturer", "version")
    list_filter = ("manufacturer", "discontinued")
    search_fields = ("name", "manufacturer__name")
    prepopulated_fields = {"slug": ("name", "manufacturer", "version")}
    readonly_fields = (
        "thumb_image_webp",
        "thumb_image_jpeg",
        "large_image_webp",
        "large_image_jpeg",
    )

    fieldsets = (
        (
            None,
            {
                "fields": (
                    "name",
                    "manufacturer",
                    "version",
                    "slug",
                    "description",
                    "image",
                    "bom_under_construction",
                )
            },
        ),
        (
            "Links",
            {
                "fields": (
                    "manufacturer_page_link",
                    "bom_link",
                    "manual_link",
                    "modulargrid_link",
                    "rack_unit",
                    "hp",
                    "category",
                )
            },
        ),
        (
            "Cost Information",
            {
                "fields": (
                    # Built cost group
                    "cost_built",
                    "cost_built_link",
                    "cost_built_third_party",
                    # PCB only cost group
                    "cost_pcb_only",
                    "cost_pcb_only_link",
                    "cost_pcb_only_third_party",
                    # PCB plus front cost group
                    "cost_pcb_plus_front",
                    "cost_pcb_plus_front_link",
                    "cost_pcb_plus_front_third_party",
                    # Kit cost group
                    "cost_kit",
                    "cost_kit_link",
                    "cost_kit_third_party",
                    # Partial kit cost group
                    "cost_partial_kit",
                    "cost_partial_kit_link",
                    "cost_partial_kit_third_party",
                )
            },
        ),
        (
            "Other Info",
            {
                "fields": (
                    "mounting_style",
                    "discontinued",
                    "allow_comments",
                )
            },
        ),
    )

    def lookup_allowed(self, key, value=None):
        return True


class WantToBuildModulesAdmin(BaseAdmin):
    model = WantToBuildModules


class BuiltModulesAdmin(BaseAdmin):
    model = BuiltModules


class ModuleBomListComponentForItemRatingAdmin(BaseAdmin):
    model = ModuleBomListComponentForItemRating


class PcbVersionAdmin(BaseAdmin):
    model = PcbVersion


class SubstitutionAdmin(BaseAdmin):
    model = Substitution

    # Display important fields in the list view
    list_display = (
        "module_bom_list_item",
        "original_component_description",
        "confirmed_by_manufacturer",
    )

    # Add filters for relevant fields
    list_filter = (
        "module_bom_list_item__module",
        "confirmed_by_manufacturer",
    )

    # Add search fields for easy lookup
    search_fields = (
        "module_bom_list_item__description",
        "original_component_description",
        "substitute_components__name",
        "notes",
    )

    # Add an inline view to manage substitute components
    filter_horizontal = ("substitute_components",)

    def lookup_allowed(self, lookup, value=None):
        allowed_lookups = [
            "module_bom_list_item__module",
            "confirmed_by_manufacturer",
        ]
        return lookup in allowed_lookups or super().lookup_allowed(lookup, value)


class SuggestedComponentForBomListItemAdmin(BaseAdmin):
    model = SuggestedComponentForBomListItem


# Register your models here.
admin.site.register(Manufacturer, ManufacturerAdmin)
admin.site.register(Module, ModuleAdmin)
admin.site.register(WantToBuildModules, WantToBuildModulesAdmin)
admin.site.register(BuiltModules, BuiltModulesAdmin)
admin.site.register(ModuleBomListItem, ModuleBomListItemAdmin)
admin.site.register(
    ModuleBomListComponentForItemRating, ModuleBomListComponentForItemRatingAdmin
)
admin.site.register(PcbVersion, PcbVersionAdmin)
admin.site.register(Substitution, SubstitutionAdmin)
admin.site.register(
    SuggestedComponentForBomListItem, SuggestedComponentForBomListItemAdmin
)
