from django.contrib import admin
from components.models import Component, ComponentSupplier, ComponentManufacturer, Types
from core.admin import BaseAdmin


class ComponentAdmin(BaseAdmin):
    model = Component


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
