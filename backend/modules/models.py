from django.db import models
from django.utils import timezone
from django.template.defaultfilters import slugify
from components.models import Component
from accounts.models import CustomUser
from django.db.models import Sum, Q
from accounts.models import CustomUser
from django.db import models
from PIL import Image
from core.models import BaseModel
import os
from io import BytesIO
from django.core.files.base import ContentFile
import uuid
from components.models import Types

MOUNTING_STYLE = [
    ("smt", "Surface Mount (SMT)"),
    ("th", "Through Hole"),
]


class Manufacturer(BaseModel):
    id = models.UUIDField(primary_key=True, editable=False, default=uuid.uuid4)
    name = models.CharField(max_length=255)
    link = models.URLField(blank=True)
    notes = models.TextField(blank=True)
    slug = models.SlugField(blank=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(f"{self.name}")
            super(Manufacturer, self).save(*args, **kwargs)

    def __str__(self):
        return f"{self.name}"


class ModuleBomListItem(BaseModel):
    id = models.UUIDField(primary_key=True, editable=False, default=uuid.uuid4)
    description = models.CharField(max_length=255, blank=False)
    components_options = models.ManyToManyField(
        Component, blank=True, null=True, related_name="component_identity_to_component"
    )
    module = models.ForeignKey(
        "Module", blank=False, null=False, on_delete=models.PROTECT
    )
    type = models.ForeignKey(Types, on_delete=models.PROTECT)
    designators = models.CharField(
        max_length=255,
        blank=True,
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


class Module(BaseModel):
    id = models.UUIDField(primary_key=True, editable=False, default=uuid.uuid4)
    name = models.CharField(max_length=255)
    manufacturer = models.ForeignKey(Manufacturer, on_delete=models.PROTECT)
    version = models.CharField(max_length=10, default="1")
    description = models.TextField()
    image = models.ImageField(upload_to="module_imgs", blank=True)
    image_jpeg = models.ImageField(
        upload_to="module_imgs_jpeg", blank=True
    )  # JPEG version of the image
    manufacturer_page_link = models.URLField(blank=True)
    bom_link = models.URLField(blank=True)
    manual_link = models.URLField(blank=True)
    modulargrid_link = models.URLField(blank=True)
    mounting_style = models.CharField(choices=MOUNTING_STYLE, max_length=50, blank=True)
    discontinued = models.BooleanField(default=False)
    slug = models.SlugField(blank=True)

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

        if self.image:
            img = Image.open(self.image.path)

            # Resize image, keeping the aspect ratio
            max_dimension = max(img.size)
            if max_dimension > 300:
                proportion = max_dimension / 300
                new_width = round(img.width / proportion)
                new_height = round(img.height / proportion)
                img = img.resize((new_width, new_height), Image.ANTIALIAS)

            if img.format != "WEBP":
                # Save as WEBP
                output_webp = BytesIO()
                img.save(output_webp, format="WEBP", quality=75)
                output_webp.seek(0)
                self.image = ContentFile(
                    output_webp.read(), f"{os.path.splitext(self.image.name)[0]}.webp"
                )

            # Also save as JPEG for fallback
            output_jpeg = BytesIO()
            img.save(output_jpeg, format="JPEG", quality=75)
            output_jpeg.seek(0)
            self.image_jpeg = ContentFile(
                output_jpeg.read(), f"{os.path.splitext(self.image.name)[0]}.jpg"
            )

            super(Module, self).save(
                *args, **kwargs
            )  # You need to specify the class here as well

    def __str__(self):
        return f"{self.name} - {self.manufacturer}"


class WantToBuildModules(BaseModel):
    id = models.UUIDField(primary_key=True, editable=False, default=uuid.uuid4)
    user = models.ForeignKey("accounts.CustomUser", on_delete=models.CASCADE)
    module = models.ForeignKey(Module, on_delete=models.CASCADE)

    class Meta:
        verbose_name_plural = "Want-to-Build Modules"
        indexes = [
            models.Index(fields=["user"]),
        ]


class BuiltModules(BaseModel):
    id = models.UUIDField(primary_key=True, editable=False, default=uuid.uuid4)
    user = models.ForeignKey("accounts.CustomUser", on_delete=models.CASCADE)
    module = models.ForeignKey(Module, on_delete=models.CASCADE)

    class Meta:
        verbose_name_plural = "Built Modules"
        indexes = [
            models.Index(fields=["user"]),
        ]


class ModuleBomListComponentForItemRating(BaseModel):
    id = models.UUIDField(primary_key=True, editable=False, default=uuid.uuid4)
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
