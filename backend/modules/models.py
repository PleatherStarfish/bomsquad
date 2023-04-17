from django.db import models
from django.utils import timezone
from django.template.defaultfilters import slugify
from components.models import Component
from accounts.models import CustomUser
from django.db.models import Sum, Q
from accounts.models import CustomUser


class Manufacturer(models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=255)
    notes = models.TextField(blank=True)
    date_updated = models.DateField(default=timezone.now, blank=False)
    slug = models.SlugField(blank=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(f"{self.name}")
            super(Manufacturer, self).save(*args, **kwargs)

    def __str__(self):
        return f"{self.name}"


class ModuleBomListItem(models.Model):
    id = models.BigAutoField(primary_key=True)
    description = models.CharField(max_length=255, blank=False)
    components_options = models.ManyToManyField(
        Component, blank=False, related_name="component_identity_to_component"
    )
    module = models.ForeignKey(
        "Module", blank=False, null=False, on_delete=models.PROTECT
    )
    type = models.CharField(max_length=100, blank=True)
    designators = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="A list of locations on the circuit board.",
    )
    quantity = models.PositiveIntegerField(default=0, blank=False)
    notes = models.TextField(blank=True)

    class Meta:
        verbose_name_plural = "Module BOM List Items"
        indexes = [
            models.Index(fields=["module"]),
        ]

    def __str__(self):
        return f"{self.module.name} ({self.description})"

    def save(self, *args, **kwargs):
        if not self.type:
            self.type = self.components_options.all().first().type.name
        super(ModuleBomListItem, self).save(*args, **kwargs)


class Module(models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=255)
    manufacturer = models.ForeignKey(Manufacturer, on_delete=models.PROTECT)
    version = models.CharField(max_length=10, default="1")
    description = models.TextField()
    image = models.ImageField(blank=True)
    manufacturer_page_link = models.URLField(blank=True)
    bom_link = models.URLField(blank=True)
    manual_link = models.URLField(blank=True)
    modulargrid_link = models.URLField(blank=True)
    slug = models.SlugField(blank=True)
    date_updated = models.DateField(default=timezone.now, blank=False)

    def is_built_by_user(self, user):
        return self.builtmodules_set.filter(user=user).exists()

    def is_wtb_by_user(self, user):
        return self.wanttobuildmodules_set.filter(user=user).exists()

    class Meta:
        verbose_name_plural = "Modules"
        unique_together = ("name", "manufacturer", "version")

    def save(self, *args, **kwargs):
        if self.description:
            self.description = self.description
            super(Module, self).save(*args, **kwargs)
        if not self.slug:
            self.slug = slugify(f"{self.name}-{self.manufacturer}-{self.version}")
            super(Module, self).save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} - {self.manufacturer}"


class WantToBuildModules(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey("accounts.CustomUser", on_delete=models.CASCADE)
    module = models.ForeignKey(Module, on_delete=models.CASCADE)

    class Meta:
        verbose_name_plural = "Want-to-Build Modules"
        indexes = [
            models.Index(fields=["user"]),
        ]


class BuiltModules(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey("accounts.CustomUser", on_delete=models.CASCADE)
    module = models.ForeignKey(Module, on_delete=models.CASCADE)

    class Meta:
        verbose_name_plural = "Built Modules"
        indexes = [
            models.Index(fields=["user"]),
        ]


class ModuleBomListComponentForItemRating(models.Model):
    id = models.BigAutoField(primary_key=True)
    module_bom_list_item = models.ForeignKey(
        ModuleBomListItem, blank=False, null=False, on_delete=models.CASCADE
    )
    component = models.ForeignKey(
        Component, blank=False, null=False, on_delete=models.CASCADE
    )
    user = models.ForeignKey(
        CustomUser, blank=False, null=False, on_delete=models.CASCADE
    )
    rating = models.IntegerField(default=0)

    class Meta:
        indexes = [
            models.Index(fields=["user"]),
            models.Index(fields=["component"]),
            models.Index(fields=["module_bom_list_item"]),
            models.Index(fields=["user", "component", "module_bom_list_item"]),
        ]
        unique_together = ("module_bom_list_item", "component", "user")
