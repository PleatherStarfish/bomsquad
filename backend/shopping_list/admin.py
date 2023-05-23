from django.contrib import admin
from .models import UserShoppingList, UserSavedLists
from core.admin import BaseAdmin


class UserShoppingListAdmin(BaseAdmin):
    pass


class UserSavedListsAdmin(BaseAdmin):
    pass


# Register your models here.
admin.site.register(UserShoppingList, UserShoppingListAdmin)
admin.site.register(UserSavedLists, UserSavedListsAdmin)
