import csv
from django.conf import settings
from django.core.management.base import BaseCommand
from components.models import Component


class Command(BaseCommand):
    help = "Export components to CSV"

    def handle(self, *args, **kwargs):
        file_path = settings.BASE_DIR / "components_export.csv"

        # Query components with the necessary fields
        components = Component.objects.values(
            "supplier__name", "supplier_item_no", "link", "price"
        )

        # Open the CSV file in write mode
        with open(file_path, mode="w", newline="") as file:
            writer = csv.writer(file)
            writer.writerow(["supplier", "supplier_item_no", "link", "price"])
            for component in components:
                writer.writerow(
                    [
                        component.get("supplier__name", ""),
                        component.get("supplier_item_no", ""),
                        component.get("link", ""),
                        component.get("price", ""),
                    ]
                )

        self.stdout.write(
            self.style.SUCCESS(f"Components exported successfully to {file_path}")
        )
