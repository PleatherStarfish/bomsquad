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
    pass


class ModuleAdmin(BaseAdmin):
    pass


class WantToBuildModulesAdmin(BaseAdmin):
    pass


class BuiltModulesAdmin(BaseAdmin):
    pass


class ModuleBomListComponentForItemRatingAdmin(BaseAdmin):
    pass


# Register your models here.
admin.site.register(Manufacturer, ManufacturerAdmin)
admin.site.register(Module, ModuleAdmin)
admin.site.register(WantToBuildModules, WantToBuildModulesAdmin)
admin.site.register(BuiltModules, BuiltModulesAdmin)
admin.site.register(ModuleBomListItem, ModuleBomListItemAdmin)
admin.site.register(
    ModuleBomListComponentForItemRating, ModuleBomListComponentForItemRatingAdmin
)
