from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin
from core.admin import BaseAdmin

from .forms import CustomUserCreationForm, CustomUserChangeForm
from .models import CustomUser, UserNotes


class CustomUserAdmin(UserAdmin):
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    model = CustomUser
    fieldsets = UserAdmin.fieldsets + ((("History"), {"fields": ("history",)}),)


class UserNotesAdmin(BaseAdmin):
    model = UserNotes


admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(UserNotes, UserNotesAdmin)
