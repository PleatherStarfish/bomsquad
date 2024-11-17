from django.core.management.base import BaseCommand
from components.models import Component, ComponentSupplierItem


class Command(BaseCommand):
    help = "Populate ComponentSupplierItem from existing fields in Component"

    def handle(self, *args, **kwargs):
        components = Component.objects.all()
        items_created = 0

        for component in components:
            # Skip components without a supplier
            if not component.supplier:
                continue

            # Skip if the ComponentSupplierItem already exists
            if ComponentSupplierItem.objects.filter(
                component=component, supplier=component.supplier
            ).exists():
                continue

            # Create a ComponentSupplierItem
            supplier_item = ComponentSupplierItem(
                component=component,
                supplier=component.supplier,
                supplier_item_no=component.supplier_item_no,
                price=component.price,
                pcs=component.pcs,
                link=component.link,
            )
            supplier_item.save()
            items_created += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"{items_created} ComponentSupplierItem objects created."
            )
        )
