from django.contrib.staticfiles.apps import StaticFilesConfig


class StaticFilesConfig(StaticFilesConfig):
    ignore_patterns = [
        "rest_framework",
        "import_export",
        "drf-yasg",
        ".DS_Store",
        ".DS_Store.*",
    ]
