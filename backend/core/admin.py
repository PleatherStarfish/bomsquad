from import_export.admin import ImportExportModelAdmin


class BaseAdmin(ImportExportModelAdmin):
    readonly_fields = (
        "id",
        "datetime_updated",
    )
