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


class ModuleBomListItemAdmin(ImportExportModelAdmin):
    model = ModuleBomListItem


# Register your models here.
admin.site.register(Manufacturer)
admin.site.register(Module)
admin.site.register(WantToBuildModules)
admin.site.register(BuiltModules)
admin.site.register(ModuleBomListItem, ModuleBomListItemAdmin)
admin.site.register(ModuleBomListComponentForItemRating)
