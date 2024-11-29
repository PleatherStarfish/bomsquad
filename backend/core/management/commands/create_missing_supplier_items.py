from django.core.management.base import BaseCommand
from components.models import Component, ComponentSupplierItem


class Command(BaseCommand):
    help = (
        "For every component in the database that does not have any associated supplier items, "
        "create a new associated supplier item with the same supplier, supplier_item_no, price, pcs, and link as the component."
    )

    def handle(self, *args, **options):
        components_without_supplier_items = Component.objects.filter(
            supplier_items__isnull=True
        )

        created_items_count = 0

        for component in components_without_supplier_items:
            # Skip components with no supplier
            if not component.supplier:
                self.stdout.write(
                    self.style.WARNING(
                        f"Skipping component {component.id} because it has no supplier."
                    )
                )
                continue

            # Create a new supplier item
            supplier_item = ComponentSupplierItem(
                component=component,
                supplier=component.supplier,
                supplier_item_no=component.supplier_item_no,
                price=component.price,
                pcs=component.pcs,
                link=component.link,
            )
            supplier_item.save()
            created_items_count += 1

            self.stdout.write(
                self.style.SUCCESS(
                    f"Created supplier item for component {component.id}."
                )
            )

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully created {created_items_count} supplier items."
            )
        )
