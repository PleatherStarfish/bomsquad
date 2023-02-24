from django.db import models
from django.utils import timezone
from django.template.defaultfilters import slugify

# from components.models import Component
from django.core.files.storage import FileSystemStorage


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
    #     component_bom_list = models.ManyToManyField(
    #         ModuleBomListItem, blank=True, related_name="module_component_to_identity"
    #     )
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
    user = models.ForeignKey("accounts.CustomUser", on_delete=models.CASCADE)
    module = models.ForeignKey(Module, on_delete=models.CASCADE)

    class Meta:
        verbose_name_plural = "Want-to-Build Modules"


class BuiltModules(models.Model):
    user = models.ForeignKey("accounts.CustomUser", on_delete=models.CASCADE)
    module = models.ForeignKey(Module, on_delete=models.CASCADE)

    class Meta:
        verbose_name_plural = "Built Modules"
