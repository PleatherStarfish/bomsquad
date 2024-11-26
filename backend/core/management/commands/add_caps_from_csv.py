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
    "pF": "pF",
    "NF": "nF",
    "nF": "nF",
    "UF": "μF",
    "μF": "μF",
    "MF": "mF",
    "mF": "mF",
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
            raw_unit = raw_unit.strip()  # Remove extra whitespace if any
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
                self.stdout.write(
                    self.style.SUCCESS(f"CSV file '{csv_file}' loaded successfully.")
                )

                # Ensure capacitor type exists
                component_type_name = "Capacitor"
                component_type, _ = Types.objects.get_or_create(
                    name=component_type_name
                )
                self.stdout.write(
                    self.style.SUCCESS(
                        f"Ensured component type '{component_type_name}' exists."
                    )
                )

                # Supplier setup (e.g., Tayda Electronics)
                supplier_name = "Tayda Electronics"
                try:
                    supplier = ComponentSupplier.objects.get(name=supplier_name)
                    self.stdout.write(
                        self.style.SUCCESS(f"Found supplier '{supplier_name}'.")
                    )
                except ComponentSupplier.DoesNotExist:
                    raise ValueError(
                        f"Supplier '{supplier_name}' does not exist in the database."
                    )

                for row in reader:
                    self.stdout.write(self.style.NOTICE(f"Processing row: {row}"))
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
                        self.stdout.write(
                            self.style.NOTICE(
                                f"Normalized capacitance: {farads} {farads_unit}."
                            )
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

                        # Fetch or create SizeStandard
                        size, _ = SizeStandard.objects.get_or_create(name=size_name)
                        self.stdout.write(
                            self.style.SUCCESS(
                                f"Ensured SizeStandard '{size_name}' exists."
                            )
                        )

                        # Fetch or create Category
                        category, _ = Category.objects.get_or_create(name=category_name)
                        self.stdout.write(
                            self.style.SUCCESS(
                                f"Ensured Category '{category_name}' exists."
                            )
                        )

                        description = f"{farads}{farads_unit} {category_name} ({MOUNTING_STYLES[mounting_style]}) by {manufacturer_name or 'Various'}"

                        # Retrieve or update the Component
                        component, created = Component.objects.update_or_create(
                            supplier=supplier,
                            supplier_item_no=sku,
                            defaults={
                                "type": component_type,
                                "manufacturer": manufacturer,
                                "category": category,
                                "farads": farads,
                                "farads_unit": farads_unit,
                                "voltage_rating": voltage_rating,
                                "tolerance": tolerance,
                                "mounting_style": mounting_style,
                                "size": size,
                                "link": link,
                                "description": description,
                            },
                        )
                        if created:
                            self.stdout.write(
                                self.style.SUCCESS(f"Created new Component: {sku}.")
                            )
                        else:
                            self.stdout.write(
                                self.style.WARNING(
                                    f"Updated existing Component: {sku}."
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
                        if supplier_item_created:
                            self.stdout.write(
                                self.style.SUCCESS(
                                    f"Created new SupplierItem for SKU: {sku}."
                                )
                            )
                        else:
                            supplier_item.price = price
                            supplier_item.link = link
                            supplier_item.save()
                            self.stdout.write(
                                self.style.NOTICE(
                                    f"Updated SupplierItem for SKU: {sku}."
                                )
                            )

                    except Exception as e:
                        self.stderr.write(
                            self.style.ERROR(f"Error processing row {row}: {e}")
                        )
                        with open(
                            "failed_rows.csv", "a", encoding="utf-8"
                        ) as error_file:
                            writer = csv.DictWriter(error_file, fieldnames=row.keys())
                            writer.writerow(row)

            self.stdout.write(self.style.SUCCESS("Database update completed."))

        except FileNotFoundError:
            self.stderr.write(self.style.ERROR(f"File not found: {csv_file}"))
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Error reading CSV file: {e}"))
