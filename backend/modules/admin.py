from django.contrib import admin
from .models import Manufacturer, Module, WantToBuildModules, BuiltModules

# Register your models here.
admin.site.register(Manufacturer)
admin.site.register(Module)
admin.site.register(WantToBuildModules)
admin.site.register(BuiltModules)
