from django.db import models
from django.template.defaultfilters import slugify
from components.models import Component
from django.db import models
from PIL import Image
from core.models import BaseModel
import os
from io import BytesIO
from django.core.files.base import ContentFile
import uuid
from components.models import Types
from django.urls import reverse
from django.core.validators import MinValueValidator, MaxValueValidator


MOUNTING_STYLE = [
    ("smt", "Surface Mount (SMT)"),
    ("th", "Through Hole"),
]


class Manufacturer(BaseModel):
    id = models.UUIDField(primary_key=True, editable=False, default=uuid.uuid4)
    name = models.CharField(max_length=255, unique=True)
    link = models.URLField(blank=True)
    notes = models.TextField(blank=True)
    slug = models.SlugField(blank=True)

    class Meta:
        verbose_name_plural = "Manufacturer"
        ordering = ["name"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(f"{self.name}")
        super(Manufacturer, self).save(*args, **kwargs)

    def __str__(self):
        return f"{self.name}"


class PcbVersion(BaseModel):
    id = models.UUIDField(primary_key=True, editable=False, default=uuid.uuid4)
    module = models.ForeignKey(
        "Module", blank=False, null=False, on_delete=models.PROTECT
    )
    version = models.CharField(max_length=50, default="1")
    order = models.PositiveIntegerField(default=0, blank=False)

    def __str__(self):
        version_str = f" - version {self.version}" if self.version.isdigit() else ""
        return f"{self.module.name}{version_str} - {self.order}"


class ModuleBomListItem(BaseModel):
    id = models.UUIDField(primary_key=True, editable=False, default=uuid.uuid4)
    description = models.CharField(max_length=255, blank=False)
    components_options = models.ManyToManyField(
        Component, blank=True, related_name="component_identity_to_component"
    )
    module = models.ForeignKey(
        "Module", blank=False, null=False, on_delete=models.PROTECT
    )
    pcb_version = models.ManyToManyField(PcbVersion, related_name="pcb_version")
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
        pcb_versions_str = " & ".join(
            [str(pcb.version) for pcb in self.pcb_version.all()]
        )
        if not pcb_versions_str or len(pcb_versions_str) <= 1:
            return f"{self.module.name} -- ({self.description})"
        return f"{self.module.name} -- {pcb_versions_str} -- {self.description}"

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
    thumb_image_webp = models.ImageField(upload_to="module_imgs_thumb_webp", blank=True)
    thumb_image_jpeg = models.ImageField(upload_to="module_imgs_thumb_jpeg", blank=True)
    large_image_webp = models.ImageField(upload_to="module_imgs_large_webp", blank=True)
    large_image_jpeg = models.ImageField(upload_to="module_imgs_large_jpeg", blank=True)
    manufacturer_page_link = models.URLField(blank=True)
    bom_link = models.URLField(blank=True)
    manual_link = models.URLField(blank=True)
    modulargrid_link = models.URLField(blank=True)
    mounting_style = models.CharField(choices=MOUNTING_STYLE, max_length=50, blank=True)
    discontinued = models.BooleanField(default=False)
    slug = models.SlugField(blank=True)
    allow_comments = models.BooleanField("allow comments", default=True)

    def is_built_by_user(self, user):
        return self.builtmodules_set.filter(user=user).exists()

    def is_wtb_by_user(self, user):
        return self.wanttobuildmodules_set.filter(user=user).exists()

    def get_absolute_url(self):
        return reverse(
            "module",
            kwargs={
                "slug": self.slug,
            },
        )

    class Meta:
        verbose_name_plural = "Modules"
        unique_together = ("name", "manufacturer", "version")
        ordering = ["name"]

    def save(self, *args, **kwargs):
        # Handle slug generation
        if not self.slug:
            self.slug = slugify(f"{self.name}-{self.manufacturer}-{self.version}")

        if self.image:
            self.process_image(self.image, "thumb", 300)
            self.process_image(self.image, "large", 1200)

        super(Module, self).save(*args, **kwargs)  # Save the instance

    def process_image(self, image_field, size_type, max_dimension):
        img = Image.open(image_field)

        # Resize image
        if max(img.size) > max_dimension:
            img.thumbnail((max_dimension, max_dimension), Image.ANTIALIAS)

        # Save WEBP
        output_webp = BytesIO()
        img.save(output_webp, format="WEBP", quality=75)
        output_webp.seek(0)
        if size_type == "thumb":
            self.thumb_image_webp.save(
                f"{os.path.splitext(image_field.name)[0]}_thumb.webp",
                ContentFile(output_webp.read()),
                save=False,
            )
        else:
            self.large_image_webp.save(
                f"{os.path.splitext(image_field.name)[0]}_large.webp",
                ContentFile(output_webp.read()),
                save=False,
            )

        # Convert image to RGB if it has an alpha channel
        if img.mode in ("RGBA", "LA"):
            background = Image.new("RGB", img.size, (255, 255, 255))
            background.paste(img, mask=img.split()[3])  # 3 is the alpha channel
            img = background

        # Save JPEG
        output_jpeg = BytesIO()
        img.save(output_jpeg, format="JPEG", quality=75)
        output_jpeg.seek(0)
        if size_type == "thumb":
            self.thumb_image_jpeg.save(
                f"{os.path.splitext(image_field.name)[0]}_thumb.jpg",
                ContentFile(output_jpeg.read()),
                save=False,
            )
        else:
            self.large_image_jpeg.save(
                f"{os.path.splitext(image_field.name)[0]}_large.jpg",
                ContentFile(output_jpeg.read()),
                save=False,
            )

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
        "accounts.CustomUser", blank=False, null=False, on_delete=models.CASCADE
    )
    rating = models.PositiveSmallIntegerField(
        default=0, validators=[MinValueValidator(1), MaxValueValidator(5)]
    )

    class Meta:
        indexes = [
            models.Index(fields=["user"]),
            models.Index(fields=["component"]),
            models.Index(fields=["module_bom_list_item"]),
            models.Index(fields=["user", "component", "module_bom_list_item"]),
        ]
        unique_together = ("module_bom_list_item", "component", "user")
