from django.contrib import admin
from import_export.admin import ImportExportModelAdmin
from .models import (
    Manufacturer,
    Module,
    WantToBuildModules,
    BuiltModules,
    ModuleBomListItem,
    ModuleBomListComponentForItemRating,
)
from core.admin import BaseAdmin


class ModuleBomListItemAdmin(BaseAdmin):
    model = ModuleBomListItem


class ManufacturerAdmin(BaseAdmin):
    model = Manufacturer


class ModuleAdmin(BaseAdmin):
    model = Module


class WantToBuildModulesAdmin(BaseAdmin):
    model = WantToBuildModules


class BuiltModulesAdmin(BaseAdmin):
    model = BuiltModules


class ModuleBomListComponentForItemRatingAdmin(BaseAdmin):
    model = ModuleBomListComponentForItemRating


# Register your models here.
admin.site.register(Manufacturer, ManufacturerAdmin)
admin.site.register(Module, ModuleAdmin)
admin.site.register(WantToBuildModules, WantToBuildModulesAdmin)
admin.site.register(BuiltModules, BuiltModulesAdmin)
admin.site.register(ModuleBomListItem, ModuleBomListItemAdmin)
admin.site.register(
    ModuleBomListComponentForItemRating, ModuleBomListComponentForItemRatingAdmin
)
