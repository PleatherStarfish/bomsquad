from django.db import models
from accounts.models import CustomUser
from components.models import Component
from core.models import BaseModel
from django.contrib.postgres.indexes import GinIndex
import json
import bleach
import uuid


class UserInventory(BaseModel):
    id = models.UUIDField(primary_key=True, editable=False, default=uuid.uuid4)
    component = models.ForeignKey(Component, on_delete=models.CASCADE)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=0, blank=False)
    location = models.JSONField(null=True, blank=True)
    old_quantity = models.PositiveIntegerField(default=0, blank=False)
    old_location = models.JSONField(null=True, blank=True)

    class Meta:
        verbose_name_plural = "User Component Inventory"
        indexes = [
            models.Index(fields=["user"]),
            models.Index(fields=["user", "component"]),
            GinIndex(fields=["location"]),
        ]
        unique_together = ("user", "component", "location")

    def __str__(self):
        return f"[ {self.user} ] - [ {self.location} ] - {self.component}"

    def save(self, *args, **kwargs):
        # Convert the list to a JSON string
        json_string = json.dumps(self.location)

        # Clean the JSON string with Bleach
        cleaned_json_string = bleach.clean(json_string)

        try:
            # Convert the cleaned JSON string back to a list
            cleaned_list = json.loads(cleaned_json_string)
        except json.JSONDecodeError:
            cleaned_list = []

        # Update the field with the cleaned list
        self.location = cleaned_list

        super().save(*args, **kwargs)
