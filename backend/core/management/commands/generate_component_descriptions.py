from django.core.management.base import BaseCommand
from components.models import Component, ComponentSupplier
from django.db import models


class Command(BaseCommand):
    help = "Update descriptions only for Components with ohms, farads, or from Mouser Electronics."

    def handle(self, *args, **kwargs):
        # Fetch the Mouser Electronics supplier instance
        try:
            mouser_supplier = ComponentSupplier.objects.get(name="Mouser Electronics")
        except ComponentSupplier.DoesNotExist:
            self.stderr.write("Mouser Electronics supplier not found.")
            return

        # Filter components with ohms, farads, or Mouser Electronics as the supplier
        components = Component.objects.filter(
            models.Q(ohms__isnull=False)
            | models.Q(farads__isnull=False)
            | models.Q(supplier=mouser_supplier)
        )
        updated_count = 0

        for component in components:
            new_description = self.generate_description(component)

            if new_description and new_description != component.description:
                component.description = new_description
                component.save()
                updated_count += 1

        self.stdout.write(
            self.style.SUCCESS(f"{updated_count} Component descriptions updated.")
        )

    def generate_description(self, component):
        """
        Generate a short and logical description for a Component, ensuring clarity
        and including manufacturer when a part number is present.
        """
        description = ""

        # Prioritize value fields
        if component.ohms and component.ohms_unit:
            description = f"{component.ohms}{component.ohms_unit} Resistor"

        elif component.farads and component.farads_unit:
            description = f"{component.farads}{component.farads_unit} Capacitor"

        elif component.forward_current and component.forward_voltage:
            description = (
                f"{component.forward_current}, {component.forward_voltage} LED"
            )

        elif component.type:
            description = f"{component.type.name}"

        # Add manufacturer and part number if available
        if component.manufacturer and component.manufacturer_part_no:
            description += f" by {component.manufacturer.name} (Part No: {component.manufacturer_part_no})"

        # Add manufacturer if part number is unavailable
        elif component.manufacturer:
            description += f" by {component.manufacturer.name}"

        # Fallback to part number only if no other info is available
        elif component.manufacturer_part_no:
            description += f" (Part No: {component.manufacturer_part_no})"

        return description.strip()
