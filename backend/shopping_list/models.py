from django.db import models
from modules.models import Module, ModuleBomListItem
from components.models import Component
from accounts.models import CustomUser


class UserProfileShoppingListData(models.Model):
    module = models.ForeignKey(Module, on_delete=models.CASCADE)
    bom_item = models.ForeignKey(ModuleBomListItem, on_delete=models.CASCADE)
    component = models.ForeignKey(Component, on_delete=models.CASCADE)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=0, blank=False)
    location = models.JSONField(null=True, blank=True)

    class Meta:
        verbose_name_plural = "User Shopping List"

    def __str__(self):
        return f"[ {self.profile} ] - {self.component}"
