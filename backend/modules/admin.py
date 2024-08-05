from django.contrib import admin
from import_export.admin import ImportExportModelAdmin
from .models import (
    Manufacturer,
    Module,
    WantToBuildModules,
    BuiltModules,
    ModuleBomListItem,
    ModuleBomListComponentForItemRating,
    PcbVersion,
)
from core.admin import BaseAdmin


class ModuleBomListItemAdmin(BaseAdmin):
    model = ModuleBomListItem
    filter_horizontal = ("components_options", "pcb_version")


class ManufacturerAdmin(BaseAdmin):
    model = Manufacturer


class ModuleAdmin(admin.ModelAdmin):
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
                )
            },
        ),
        (
            "Other Info",
            {"fields": ("mounting_style", "discontinued", "allow_comments")},
        ),
    )


class WantToBuildModulesAdmin(BaseAdmin):
    model = WantToBuildModules


class BuiltModulesAdmin(BaseAdmin):
    model = BuiltModules


class ModuleBomListComponentForItemRatingAdmin(BaseAdmin):
    model = ModuleBomListComponentForItemRating


class PcbVersionAdmin(BaseAdmin):
    model = PcbVersion


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
