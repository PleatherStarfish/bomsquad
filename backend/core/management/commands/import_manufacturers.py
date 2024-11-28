import csv
from difflib import get_close_matches
from django.core.management.base import BaseCommand
from components.models import ComponentManufacturer


class Command(BaseCommand):
    help = "Import manufacturers into the database from a CSV file."

    def add_arguments(self, parser):
        parser.add_argument(
            "csv_file", type=str, help="Path to the CSV file containing manufacturers."
        )

    def handle(self, *args, **kwargs):
        csv_file = kwargs["csv_file"]

        try:
            with open(csv_file, "r", encoding="utf-8") as file:
                reader = csv.DictReader(file)
                manufacturers = [row["Title"].strip() for row in reader]

            self.stdout.write(
                f"Found {len(manufacturers)} manufacturers in the CSV file."
            )

            for manufacturer in manufacturers:
                # Check if the manufacturer already exists, ignoring case
                existing_manufacturers = ComponentManufacturer.objects.filter(
                    name__iexact=manufacturer
                )
                if existing_manufacturers.exists():
                    match = existing_manufacturers.first()
                    self.stdout.write(
                        self.style.WARNING(
                            f"Skipped: '{manufacturer}' already exists as '{match.name}'."
                        )
                    )
                    continue

                # Use fuzzy matching to find similar existing manufacturers
                all_manufacturers = list(
                    ComponentManufacturer.objects.values_list("name", flat=True)
                )
                close_matches = get_close_matches(
                    manufacturer, all_manufacturers, n=1, cutoff=0.9
                )

                if close_matches:
                    self.stdout.write(
                        self.style.WARNING(
                            f"Skipped: '{manufacturer}' closely matches '{close_matches[0]}'."
                        )
                    )
                    continue

                # If no match, create a new manufacturer
                ComponentManufacturer.objects.create(name=manufacturer)
                self.stdout.write(self.style.SUCCESS(f"Added: '{manufacturer}'."))

        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Error: {str(e)}"))
