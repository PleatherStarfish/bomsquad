from django.db.models.signals import post_save
from django.dispatch import receiver
from inventory.models import UserInventory
from django.utils.timezone import now
from django.db.models.signals import pre_save
from django.core.serializers.json import DjangoJSONEncoder
from uuid import UUID
import json
import bleach


class CustomJSONEncoder(DjangoJSONEncoder):
    def default(self, o):
        if isinstance(o, UUID):
            return str(o)
        return super().default(o)


@receiver(pre_save, sender=UserInventory)
def save_old_fields(sender, instance, **kwargs):
    if instance.pk:
        try:
            old_instance = UserInventory.objects.get(pk=instance.pk)
            instance.old_quantity = old_instance.quantity
            instance.old_location = old_instance.location
        except UserInventory.DoesNotExist:
            pass


@receiver(post_save, sender=UserInventory)
def update_user_inventory_history(sender, instance, created, **kwargs):
    # Get the related CustomUser object
    user = instance.user

    # Create a new entry for the change history
    history_entry = {
        "component_id": str(instance.component_id),  # Convert UUID to string
        "quantity_before": instance.old_quantity,
        "quantity_after": instance.quantity,
        "location_before": instance.old_location,
        "location_after": instance.location,
        "timestamp": str(now()),
    }

    # Update the history field on the CustomUser object
    user.history = (
        json.loads(user.history) if isinstance(user.history, str) else user.history
    )
    user.history = user.history or []

    # If the history array has more than 1000 items, remove the oldest one
    if len(user.history) >= 1000:
        user.history.pop(0)

    user.history.append(history_entry)
    user.save()

    # Serialize the history field using the custom JSON encoder
    user.history = json.dumps(user.history, cls=CustomJSONEncoder)
    user.save()
