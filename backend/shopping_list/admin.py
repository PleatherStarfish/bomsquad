from django.contrib import admin
from .models import UserShoppingList, UserSavedLists

# Register your models here.
admin.site.register(UserShoppingList)
admin.site.register(UserSavedLists)
