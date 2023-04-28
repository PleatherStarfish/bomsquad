from django.db.models.signals import post_save
from django.dispatch import receiver
from inventory.models import UserInventory
from django.utils.timezone import now


@receiver(post_save, sender=UserInventory)
def update_user_inventory_history(sender, instance, created, **kwargs):
    # Get the related CustomUser object
    user = instance.user

    # Create a new entry for the change history
    history_entry = {
        "component_id": instance.component_id,
        "quantity_before": instance.tracker.previous('quantity'),
        "quantity_after": instance.quantity,
        "location_before": instance.tracker.previous('location'),
        "location_after": instance.location,
        "timestamp": str(now()),
    }

    # Update the history field on the CustomUser object
    user.history = user.history or []

    # If the history array has more than 1000 items, remove the oldest one
    if len(user.history) >= 1000:
        user.history.pop(0)

    user.history.append(history_entry)
    user.save()
