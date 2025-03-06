import csv
import json
import os
from django.core.management.base import BaseCommand
from components.models import Component, ComponentSupplier, ComponentSupplierItem


class Command(BaseCommand):
    help = "Dump electrolytic capacitors with Tayda as a supplier into a CSV file"

    def handle(self, *args, **kwargs):
        csv_file = "tayda_capacitors_dump.csv"

        try:
            # Get the Tayda Electronics supplier object
            tayda_supplier = ComponentSupplier.objects.get(
                name__icontains="Tayda Electronics"
            )
        except ComponentSupplier.DoesNotExist:
            self.stdout.write(self.style.ERROR("Tayda Electronics supplier not found."))
            return

        # Get electrolytic capacitors associated with Tayda supplier
        electrolytic_capacitors = Component.objects.filter(
            type__name__icontains="capacitor",  # Ensure it's a capacitor
            category__name__icontains="electrolytic",  # Must be under "Electrolytic" category
            supplier_items__supplier=tayda_supplier,  # Must have Tayda as a supplier
        ).distinct()

        if not electrolytic_capacitors.exists():
            self.stdout.write(self.style.WARNING("No matching components found."))
            return

        # Write results to CSV
        with open(csv_file, mode="w", newline="") as file:
            writer = csv.writer(file)
            writer.writerow(
                ["Component ID", "Description", "Supplier Item No", "Supplier Link"]
            )

            for component in electrolytic_capacitors:
                supplier_item = ComponentSupplierItem.objects.filter(
                    component=component, supplier=tayda_supplier
                ).first()

                if supplier_item:
                    writer.writerow(
                        [
                            component.id,
                            component.description,
                            supplier_item.supplier_item_no,
                            supplier_item.link or "No Link",
                        ]
                    )
                    self.stdout.write(
                        self.style.SUCCESS(f"Exported: {component.description}")
                    )
                else:
                    writer.writerow(
                        [
                            component.id,
                            component.description,
                            "No Supplier Item No",
                            "No Link",
                        ]
                    )
                    self.stdout.write(
                        self.style.WARNING(
                            f"No supplier item for: {component.description}"
                        )
                    )

        self.stdout.write(self.style.SUCCESS(f"CSV saved to {csv_file}"))
