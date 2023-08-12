from django.contrib import admin
from .models import Page
from .forms import PageForm
from django.db import models
from tinymce.widgets import TinyMCE


class PageAdmin(admin.ModelAdmin):
    form = PageForm


admin.site.register(Page, PageAdmin)
