from components.models import (
    Component,
    ComponentSupplier,
    ComponentSupplierItem,
    ComponentManufacturer,
    Types,
    SizeStandard,
    Category,
)
from djmoney.money import Money
import csv
from django.core.management.base import BaseCommand
from django.db import transaction

MOUNTING_STYLES = {
    "smt": "Surface Mount",
    "th": "Through Hole",
}  # Valid mounting styles


class Command(BaseCommand):
    help = "Update database with transistor data from a CSV file"

    def add_arguments(self, parser):
        parser.add_argument(
            "csv_file", type=str, help="Path to the CSV file with transistor data"
        )

    @transaction.atomic
    def handle(self, *args, **kwargs):
        csv_file = kwargs["csv_file"]

        try:
            with open(csv_file, "r", encoding="utf-8") as file:
                reader = csv.DictReader(file)

                # Fetch or create the "Transistor" type
                transistor_type, _ = Types.objects.get_or_create(name="Transistor")

                # Fetch or create the supplier (e.g., Tayda Electronics)
                supplier_name = "Tayda Electronics"
                supplier, _ = ComponentSupplier.objects.get_or_create(
                    name=supplier_name
                )

                for row in reader:
                    try:
                        # Extract data from CSV
                        sku = row["SKU"]
                        size_name = row["Size"]
                        mounting_style = row["Mounting Style"].lower()
                        category_name = row["Category"]
                        manufacturer_name = row["Manufacturer"]
                        price = Money(row["Price"], "USD") if row["Price"] else None
                        link = row["Link"]

                        # Validate Mounting Style
                        if mounting_style not in MOUNTING_STYLES:
                            raise ValueError(
                                f"Invalid Mounting Style '{mounting_style}' for SKU {sku}"
                            )

                        # Fetch or create Manufacturer
                        manufacturer = ComponentManufacturer.objects.filter(
                            name=manufacturer_name
                        ).first()

                        # Fetch or create SizeStandard
                        size, _ = SizeStandard.objects.get_or_create(name=size_name)

                        # Fetch or create Category
                        category, _ = Category.objects.get_or_create(name=category_name)

                        # Retrieve or update the Component
                        try:
                            component = Component.objects.get(
                                supplier=supplier, supplier_item_no=sku
                            )

                            # Update fields if necessary
                            updated = False
                            if component.manufacturer != manufacturer:
                                component.manufacturer = manufacturer
                                updated = True
                            if component.category != category:
                                component.category = category
                                updated = True
                            if component.size != size:
                                component.size = size
                                updated = True
                            if component.mounting_style != mounting_style:
                                component.mounting_style = mounting_style
                                updated = True
                            if component.link != link:
                                component.link = link
                                updated = True

                            if updated:
                                component.save()
                                self.stdout.write(
                                    self.style.WARNING(
                                        f"Updated Component: {component.description}"
                                    )
                                )

                        except Component.DoesNotExist:
                            # Create a new Component if it doesn't exist
                            component = Component.objects.create(
                                supplier=supplier,
                                supplier_item_no=sku,
                                type=transistor_type,
                                manufacturer=manufacturer,
                                category=category,
                                size=size,
                                mounting_style=mounting_style,
                                link=link,
                            )
                            self.stdout.write(
                                self.style.SUCCESS(
                                    f"Created Component: {component.description}"
                                )
                            )

                        # Create or update ComponentSupplierItem
                        supplier_item, supplier_item_created = (
                            ComponentSupplierItem.objects.get_or_create(
                                component=component,
                                supplier=supplier,
                                supplier_item_no=sku,
                                defaults={"price": price, "pcs": 1, "link": link},
                            )
                        )
                        if not supplier_item_created:
                            supplier_item.price = price
                            supplier_item.link = link
                            supplier_item.save()

                            self.stdout.write(
                                self.style.NOTICE(
                                    f"Updated SupplierItem: SKU {sku}, Price {price}"
                                )
                            )

                    except Exception as e:
                        self.stderr.write(
                            self.style.ERROR(f"Error processing row {row}: {e}")
                        )

            self.stdout.write(self.style.SUCCESS("Database update completed."))

        except FileNotFoundError:
            self.stderr.write(self.style.ERROR(f"File not found: {csv_file}"))
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Error reading CSV file: {e}"))
