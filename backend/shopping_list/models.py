from django.db import models
from django.db.models.constraints import UniqueConstraint
from django.db.models import Q
from core.models import BaseModel

from modules.models import Module, ModuleBomListItem
from components.models import Component
from django.core.exceptions import ValidationError
from django.utils import timezone
import uuid


class UserShoppingList(BaseModel):
    id = models.UUIDField(primary_key=True, editable=False, default=uuid.uuid4)
    module = models.ForeignKey(Module, null=True, blank=True, on_delete=models.CASCADE)
    bom_item = models.ForeignKey(
        ModuleBomListItem, null=True, blank=True, on_delete=models.CASCADE
    )
    component = models.ForeignKey(Component, on_delete=models.CASCADE)
    user = models.ForeignKey(
        "accounts.CustomUser", blank=False, null=False, on_delete=models.CASCADE
    )
    quantity = models.PositiveIntegerField(default=1, blank=False, null=False)

    class Meta:
        verbose_name_plural = "User Shopping List"
        indexes = [
            models.Index(fields=["user"]),
            models.Index(fields=["user", "component"]),
            models.Index(fields=["user", "bom_item"]),
            models.Index(fields=["user", "module"]),
            models.Index(fields=["user", "component", "bom_item"]),
            models.Index(fields=["user", "component", "bom_item", "module"]),
        ]
        constraints = [
            UniqueConstraint(
                fields=["user", "component", "bom_item", "module"],
                name="unique_with_optional",
            ),
            UniqueConstraint(
                fields=["user", "component"],
                condition=Q(bom_item=None, module=None),
                name="unique_without_optional",
            ),
        ]

    def clean(self):
        if self.quantity < 1:
            raise ValidationError("Quantity must be at least 1")

    def __str__(self):
        return f"[ {self.user} ] - {self.component}"


class UserShoppingListSaved(BaseModel):
    id = models.UUIDField(primary_key=True, editable=False, default=uuid.uuid4)
    time_saved = models.DateTimeField(default=timezone.now)
    module = models.ForeignKey(Module, null=True, blank=True, on_delete=models.CASCADE)
    bom_item = models.ForeignKey(
        ModuleBomListItem, null=True, blank=True, on_delete=models.CASCADE
    )
    component = models.ForeignKey(Component, on_delete=models.CASCADE)
    user = models.ForeignKey(
        "accounts.CustomUser", blank=False, null=False, on_delete=models.CASCADE
    )
    quantity = models.PositiveIntegerField(default=1, blank=False, null=False)
    name = models.CharField(max_length=255, blank=True)
    notes = models.ForeignKey(
        "accounts.UserNotes",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="saved_shopping_list_notes",
    )

    class Meta:
        verbose_name_plural = "User Archived Shopping Lists"
        indexes = [
            models.Index(fields=["user"]),
            models.Index(fields=["user", "time_saved"]),
            models.Index(fields=["time_saved", "user"]),
            models.Index(fields=["time_saved"]),
        ]

    def clean(self):
        if self.quantity < 1:
            raise ValidationError("Quantity must be at least 1")

    def __str__(self):
        return f"[ {self.time_saved} ] - {self.user.email}"
