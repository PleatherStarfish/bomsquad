from django.contrib import admin
from import_export.admin import ImportExportModelAdmin


class BaseAdmin(ImportExportModelAdmin):
    readonly_fields = ("datetime_updated",)
