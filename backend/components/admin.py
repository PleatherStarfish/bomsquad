from django.contrib import admin
from components.models import Component, ComponentSupplier, ComponentManufacturer, Types
from import_export.admin import ImportExportModelAdmin


class ComponentAdmin(ImportExportModelAdmin):
    model = Component


class TypesAdmin(ImportExportModelAdmin):
    model = Types


class ComponentSupplierAdmin(ImportExportModelAdmin):
    model = ComponentSupplier


class ComponentManufacturerAdmin(ImportExportModelAdmin):
    model = ComponentManufacturer


# Register your models here.
admin.site.register(Component, ComponentAdmin)
admin.site.register(Types, TypesAdmin)
admin.site.register(ComponentSupplier, ComponentSupplierAdmin)
admin.site.register(ComponentManufacturer, ComponentManufacturerAdmin)
