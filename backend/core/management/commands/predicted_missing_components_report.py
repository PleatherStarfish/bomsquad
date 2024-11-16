import csv
from django.core.management.base import BaseCommand
from collections import defaultdict
from modules.models import ModuleBomListItem
from components.models import Component
from fuzzywuzzy import fuzz


class Command(BaseCommand):
    help = "Predict potentially missing components from BOM items using fuzzy matching on names."

    def handle(self, *args, **kwargs):
        # Step 1: Gather all ModuleBomListItems and their components
        all_bom_items = ModuleBomListItem.objects.prefetch_related("components_options")
        bom_item_components = {
            bom_item.id: set(bom_item.components_options.all())
            for bom_item in all_bom_items
        }

        # Step 2: Initialize report structure
        missing_components_report = []

        # Step 3: Calculate similarity scores and predict missing components
        for bom_item in all_bom_items:
            current_components = bom_item_components[bom_item.id]

            # Store components predicted as missing based on name similarity
            predicted_missing_components = defaultdict(float)

            for other_bom_item in all_bom_items:
                if bom_item.id == other_bom_item.id:
                    continue  # Skip self-comparison

                other_components = bom_item_components[other_bom_item.id]

                # Calculate name similarity score between BOM items
                name_similarity_score = fuzz.token_set_ratio(
                    bom_item.description, other_bom_item.description
                )

                # If name similarity is above a threshold, look for missing components
                if (
                    name_similarity_score >= 70
                ):  # Threshold for BOM item name similarity
                    # Find components in the other BOM item that are missing in the current BOM item
                    missing_from_current = other_components - current_components

                    for missing_component in missing_from_current:
                        # Calculate similarity between missing component's name and current BOM item's name
                        component_name_similarity = fuzz.token_set_ratio(
                            bom_item.description, missing_component.description
                        )

                        # Accumulate confidence score based on component name similarity
                        if (
                            component_name_similarity >= 60
                        ):  # Threshold for component name similarity
                            predicted_missing_components[
                                missing_component
                            ] += name_similarity_score * (
                                component_name_similarity / 100
                            )

            # Step 4: Format the results for each predicted missing component
            for component, score in predicted_missing_components.items():
                # Only include predictions with a high accumulated score (indicating high confidence)
                if score >= 150:  # Confidence threshold for prediction
                    missing_components_report.append(
                        {
                            "ModuleBomListItem ID": str(bom_item.id),
                            "Module": bom_item.module.name,
                            "BomListItem Name": bom_item.description,
                            "Predicted Missing Component": component.description,
                            "Type": component.type.name,
                            "Ohms": component.ohms,
                            "Farads": component.farads,
                            "Voltage Rating": component.voltage_rating,
                            "Tolerance": component.tolerance,
                            "Supplier Item Number": component.supplier_item_no,
                            "Confidence Score": score,
                        }
                    )

        # Step 5: Generate CSV output
        file_path = "/code/predicted_missing_components_report.csv"
        with open(file_path, mode="w", newline="") as csv_file:
            fieldnames = [
                "ModuleBomListItem ID",
                "Module",
                "BomListItem Name",
                "Predicted Missing Component",
                "Type",
                "Ohms",
                "Farads",
                "Voltage Rating",
                "Tolerance",
                "Supplier Item Number",
                "Confidence Score",
            ]
            writer = csv.DictWriter(csv_file, fieldnames=fieldnames)
            writer.writeheader()
            for row in missing_components_report:
                writer.writerow(row)

        self.stdout.write(
            self.style.SUCCESS(
                f"Predicted missing components report generated at {file_path}"
            )
        )
