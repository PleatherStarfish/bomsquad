from django.contrib import admin
from inventory.models import UserInventory
from core.admin import BaseAdmin


class UserInventoryAdmin(BaseAdmin):
    pass


# Register your models here.
admin.site.register(UserInventory, UserInventoryAdmin)
