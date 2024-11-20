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
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.db import transaction
from difflib import get_close_matches

FARAD_UNITS_MAP = {
    "PF": "pF",
    "NF": "nF",
    "UF": "μF",
    "MF": "mF",
}

MOUNTING_STYLES = {
    "smt": "Surface Mount",
    "th": "Through Hole",
}


class Command(BaseCommand):
    help = "Import capacitor data from a CSV file into the database."

    def add_arguments(self, parser):
        parser.add_argument(
            "csv_file", type=str, help="Path to the CSV file with capacitor data"
        )

    def normalize_capacitance(self, raw_value, raw_unit):
        """
        Normalize capacitance value and unit.
        """
        try:
            raw_value = float(raw_value)
            raw_unit = raw_unit.upper()  # Case-insensitive
            normalized_unit = FARAD_UNITS_MAP.get(raw_unit)
            if not normalized_unit:
                raise ValueError(f"Invalid capacitance unit: {raw_unit}")
            return raw_value, normalized_unit
        except Exception as e:
            raise ValueError(f"Error normalizing capacitance: {e}")

    def find_or_create_manufacturer(self, manufacturer_name):
        """
        Look up a manufacturer by name. If not found, return the closest fuzzy match
        or create a new manufacturer if no close match exists.
        """
        all_manufacturers = ComponentManufacturer.objects.values_list("name", flat=True)
        closest_match = get_close_matches(manufacturer_name, all_manufacturers, n=1)
        if closest_match:
            return ComponentManufacturer.objects.get(name=closest_match[0])
        else:
            manufacturer, _ = ComponentManufacturer.objects.get_or_create(
                name=manufacturer_name
            )
            return manufacturer

    @transaction.atomic
    def handle(self, *args, **kwargs):
        csv_file = kwargs["csv_file"]

        try:
            with open(csv_file, "r", encoding="utf-8") as file:
                reader = csv.DictReader(file)

                # Ensure capacitor type exists
                component_type_name = "Capacitor"
                component_type, _ = Types.objects.get_or_create(
                    name=component_type_name
                )

                # Supplier setup (e.g., Tayda Electronics)
                supplier_name = "Tayda Electronics"
                try:
                    supplier = ComponentSupplier.objects.get(name=supplier_name)
                except ComponentSupplier.DoesNotExist:
                    raise ValueError(
                        f"Supplier '{supplier_name}' does not exist in the database."
                    )

                for row in reader:
                    try:
                        # Extract data from CSV
                        sku = row["SKU"]
                        raw_farads = row["Farads"]
                        raw_farads_unit = row["Farads Unit"]
                        voltage_rating = row["Voltage"]
                        tolerance = row["Tolerance"] if "Tolerance" in row else None
                        price = Money(row["Price"], "USD") if row["Price"] else None
                        link = row["Link"]
                        mounting_style = row["Mounting Style"].lower()
                        size_name = row["Size"]
                        category_name = row["Category"]
                        manufacturer_name = row.get("Manufacturer", "").strip()

                        # Normalize capacitance
                        farads, farads_unit = self.normalize_capacitance(
                            raw_farads, raw_farads_unit
                        )

                        # Validate Mounting Style
                        if mounting_style not in MOUNTING_STYLES:
                            raise ValueError(
                                f"Invalid Mounting Style '{mounting_style}' for SKU {sku}"
                            )

                        # Find or create Manufacturer
                        manufacturer = self.find_or_create_manufacturer(
                            manufacturer_name
                        )

                        # Fetch SizeStandard
                        try:
                            size = SizeStandard.objects.get(name=size_name)
                        except SizeStandard.DoesNotExist:
                            raise ValueError(
                                f"SizeStandard '{size_name}' does not exist."
                            )

                        # Fetch Category
                        try:
                            category = Category.objects.get(name=category_name)
                        except Category.DoesNotExist:
                            raise ValueError(
                                f"Category with name '{category_name}' does not exist."
                            )

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
                            if component.farads != farads:
                                component.farads = farads
                                updated = True
                            if component.farads_unit != farads_unit:
                                component.farads_unit = farads_unit
                                updated = True
                            if component.voltage_rating != voltage_rating:
                                component.voltage_rating = voltage_rating
                                updated = True
                            if component.tolerance != tolerance:
                                component.tolerance = tolerance
                                updated = True
                            if component.mounting_style != mounting_style:
                                component.mounting_style = mounting_style
                                updated = True
                            if component.size != size:
                                component.size = size
                                updated = True
                            if component.category != category:
                                component.category = category
                                updated = True
                            if component.link != link:
                                component.link = link
                                updated = True

                            if updated:
                                component.description = ""
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
                                type=component_type,
                                manufacturer=manufacturer,
                                category=category,
                                farads=farads,
                                farads_unit=farads_unit,
                                voltage_rating=voltage_rating,
                                tolerance=tolerance,
                                mounting_style=mounting_style,
                                size=size,
                                link=link,
                                description="",
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
