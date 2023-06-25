from django.contrib import admin
from .models import UserShoppingList, UserShoppingListSaved
from core.admin import BaseAdmin


class UserShoppingListAdmin(BaseAdmin):
    model = UserShoppingList


class UserShoppingListSavedAdmin(BaseAdmin):
    model = UserShoppingListSaved


# Register your models here.
admin.site.register(UserShoppingList, UserShoppingListAdmin)
admin.site.register(UserShoppingListSaved, UserShoppingListSavedAdmin)
