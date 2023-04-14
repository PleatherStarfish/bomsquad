from django.db import models
from accounts.models import CustomUser
from components.models import Component


class UserInventory(models.Model):
    id = models.BigAutoField(primary_key=True)
    component = models.ForeignKey(Component, on_delete=models.CASCADE)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=0, blank=False)
    location = models.JSONField(null=True, blank=True)

    class Meta:
        verbose_name_plural = "User Component Inventory"
        indexes = [
            models.Index(fields=["user"]),
            models.Index(fields=["user", "component"]),
        ]
        unique_together = ("user", "component")

    def __str__(self):
        return f"[ {self.user} ] - [ {self.location} ] - {self.component}"
