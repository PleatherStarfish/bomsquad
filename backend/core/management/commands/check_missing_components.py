import csv
from django.core.management.base import BaseCommand
from django.db.models import Count
from collections import defaultdict, Counter
from modules.models import ModuleBomListItem
from components.models import Component


class Command(BaseCommand):
    help = "Check for commonly grouped components in BOM items and detect missing ones."

    def handle(self, *args, **kwargs):
        # Step 1: Identify common component groupings
        common_components = defaultdict(set)
        all_bom_items = ModuleBomListItem.objects.prefetch_related("components_options")

        for bom_item in all_bom_items:
            component_ids = set(
                bom_item.components_options.values_list("id", flat=True)
            )
            for component_id in component_ids:
                common_components[component_id].update(component_ids - {component_id})

        # Step 2: Check for missing components and gather their details
        missing_components_report = []
        for bom_item in all_bom_items:
            bom_item_components = bom_item.components_options.all()
            bom_item_component_ids = set(
                bom_item_components.values_list("id", flat=True)
            )
            missing_components = set()

            # Gather most common attributes for components in the BOM item
            type_counter = Counter(comp.type.name for comp in bom_item_components)
            most_common_type = (
                type_counter.most_common(1)[0][0] if type_counter else None
            )
            ohms_counter = Counter(
                comp.ohms for comp in bom_item_components if comp.ohms
            )
            most_common_ohms = (
                ohms_counter.most_common(1)[0][0] if ohms_counter else None
            )
            ohms_unit_counter = Counter(
                comp.ohms_unit for comp in bom_item_components if comp.ohms_unit
            )
            most_common_ohms_unit = (
                ohms_unit_counter.most_common(1)[0][0] if ohms_unit_counter else None
            )
            farads_counter = Counter(
                comp.farads for comp in bom_item_components if comp.farads
            )
            most_common_farads = (
                farads_counter.most_common(1)[0][0] if farads_counter else None
            )
            farads_unit_counter = Counter(
                comp.farads_unit for comp in bom_item_components if comp.farads_unit
            )
            most_common_farads_unit = (
                farads_unit_counter.most_common(1)[0][0]
                if farads_unit_counter
                else None
            )
            voltage_rating_counter = Counter(
                comp.voltage_rating
                for comp in bom_item_components
                if comp.voltage_rating
            )
            most_common_voltage_rating = (
                voltage_rating_counter.most_common(1)[0][0]
                if voltage_rating_counter
                else None
            )
            tolerance_counter = Counter(
                comp.tolerance for comp in bom_item_components if comp.tolerance
            )
            most_common_tolerance = (
                tolerance_counter.most_common(1)[0][0] if tolerance_counter else None
            )

            for component_id in bom_item_component_ids:
                related_components = common_components[component_id]
                missing_in_item = related_components - bom_item_component_ids
                missing_components.update(missing_in_item)

            if missing_components:
                # Retrieve details for the missing components
                missing_component_details = Component.objects.filter(
                    id__in=missing_components
                ).values(
                    "id",
                    "description",
                    "type__name",
                    "ohms",
                    "ohms_unit",
                    "farads",
                    "farads_unit",
                    "voltage_rating",
                    "tolerance",
                    "supplier_item_no",
                )

                # Add a unique row for each missing component
                for comp in missing_component_details:
                    missing_components_report.append(
                        {
                            "ModuleBomListItem ID": str(bom_item.id),
                            "Module": bom_item.module.name,
                            "BomListItem Name": bom_item.description,
                            "Most Common Type": most_common_type,
                            "Most Common Ohms": f"{most_common_ohms} {most_common_ohms_unit}",
                            "Most Common Farads": f"{most_common_farads} {most_common_farads_unit}",
                            "Most Common Voltage Rating": most_common_voltage_rating,
                            "Most Common Tolerance": most_common_tolerance,
                            "Supplier Item Number": comp["supplier_item_no"] or "N/A",
                            "Missing Component": (
                                f"{comp['type__name']} - {comp['description']} | "
                                f"Ohms: {comp['ohms']} {comp['ohms_unit']}, "
                                f"Farads: {comp['farads']} {comp['farads_unit']}, "
                                f"Voltage Rating: {comp['voltage_rating']}, "
                                f"Tolerance: {comp['tolerance']}"
                            ),
                        }
                    )

        # Step 3: Generate CSV output
        file_path = "/code/missing_components_report.csv"  # Adjust path as needed for Docker setup
        with open(file_path, mode="w", newline="") as csv_file:
            fieldnames = [
                "ModuleBomListItem ID",
                "Module",
                "BomListItem Name",
                "Most Common Type",
                "Most Common Ohms",
                "Most Common Farads",
                "Most Common Voltage Rating",
                "Most Common Tolerance",
                "Supplier Item Number",
                "Missing Component",
            ]
            writer = csv.DictWriter(csv_file, fieldnames=fieldnames)
            writer.writeheader()
            for row in missing_components_report:
                writer.writerow(row)

        self.stdout.write(
            self.style.SUCCESS(f"Missing components report generated at {file_path}")
        )
