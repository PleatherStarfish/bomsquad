from django.contrib import admin
from .models import StaticPage
from .forms import StaticPageForm


class StaticPageAdmin(admin.ModelAdmin):
    form = StaticPageForm


admin.site.register(StaticPage, StaticPageAdmin)
