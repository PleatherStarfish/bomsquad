import csv
import re
from django.core.management.base import BaseCommand
from components.models import Component, ComponentSupplierItem


class Command(BaseCommand):
    help = "Update footprint_width, component_height, and description for capacitors from CSV data."

    def handle(self, *args, **kwargs):
        csv_file = "core/management/commands/tayda_capacitors_updated.csv"  # The CSV file with extracted footprint width and height
        updated_count = 0
        unmatched_count = 0

        # Read the CSV file
        with open(csv_file, mode="r", newline="") as file:
            reader = csv.DictReader(file)
            for row in reader:
                supplier_item_no = row["Supplier Item No"].strip()
                footprint_width = row["Footprint Width"].strip()
                component_height = row["Component Height"].strip()

                # Format dimensions correctly as "18x35mm"
                dimension_text = (
                    f"{footprint_width.replace('mm', '')}x{component_height}"
                )

                # Find the component by supplier item number
                try:
                    supplier_item = ComponentSupplierItem.objects.get(
                        supplier_item_no=supplier_item_no
                    )
                    component = supplier_item.component

                    # Update the component fields
                    component.footprint_width = footprint_width
                    component.component_height = component_height

                    # Append dimensions to the description after "Electrolytic Capacitor"
                    description = component.description

                    if "Electrolytic Capacitor" in description:
                        description = re.sub(
                            r"(Electrolytic Capacitor)",
                            r"\1 " + dimension_text,
                            description,
                            count=1,
                        )
                    else:
                        description += f" {dimension_text}"

                    component.description = description.strip()
                    component.save()

                    updated_count += 1
                    self.stdout.write(
                        self.style.SUCCESS(f"Updated: {component.id} - {description}")
                    )

                except ComponentSupplierItem.DoesNotExist:
                    unmatched_count += 1
                    self.stdout.write(
                        self.style.WARNING(f"Unmatched SKU: {supplier_item_no}")
                    )

        self.stdout.write(self.style.SUCCESS(f"✅ {updated_count} components updated."))
        self.stdout.write(
            self.style.WARNING(f"⚠ {unmatched_count} supplier items not found.")
        )
