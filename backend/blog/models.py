import json
from django.db import models
from django.utils.text import slugify
from django.urls import reverse
from django_editorjs_fields import EditorJsTextField
from core.models import BaseModel
from PIL import Image
import os
from io import BytesIO
from django.core.files.base import ContentFile
from mptt.models import MPTTModel, TreeForeignKey


class Category(MPTTModel):
    """
    Represents a hierarchical structure for categorizing blog posts.
    """

    name = models.CharField(max_length=255, unique=True)
    slug = models.SlugField(unique=True, blank=True)
    parent = TreeForeignKey(
        "self",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="children",
        help_text="Parent category for this category.",
    )

    class MPTTMeta:
        order_insertion_by = ["name"]

    class Meta:
        verbose_name = "Category"
        verbose_name_plural = "Categories"
        ordering = ["name"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.get_full_path()

    def get_full_path(self):
        """
        Returns the full nested path of the category as a string.
        """
        ancestors = self.get_ancestors(include_self=True)
        return " > ".join(ancestor.name for ancestor in ancestors)


class BlogPost(BaseModel):
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True)
    content = EditorJsTextField(
        null=True,
        blank=True,
    )
    featured_image = models.ImageField(upload_to="post_imgs", blank=True, null=True)
    thumb_image_webp = models.ImageField(
        upload_to="post_imgs_thumb_webp", blank=True, null=True
    )
    thumb_image_jpeg = models.ImageField(
        upload_to="post_imgs_thumb_jpeg", blank=True, null=True
    )
    large_image_webp = models.ImageField(
        upload_to="post_imgs_large_webp", blank=True, null=True
    )
    large_image_jpeg = models.ImageField(
        upload_to="post_imgs_large_jpeg", blank=True, null=True
    )
    categories = models.ManyToManyField(
        Category,
        related_name="blog_posts",
        blank=True,
        help_text="Select categories for this post.",
    )
    meta_title = models.CharField(max_length=60, blank=True, help_text="SEO meta title")
    meta_description = models.CharField(
        max_length=160, blank=True, help_text="SEO meta description"
    )
    meta_keywords = models.CharField(
        max_length=255, blank=True, help_text="SEO meta keywords"
    )
    allow_comments = models.BooleanField("allow comments", default=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)

        if self.featured_image:
            self.process_image(self.featured_image, "thumb", 300)
            self.process_image(self.featured_image, "large", 1200)

        super(BlogPost, self).save(*args, **kwargs)

    def get_plain_text_excerpt(self, word_limit=30):
        """
        Extract plain text from the EditorJs content and truncate it to a specified word limit.
        """
        try:
            content_data = json.loads(self.content)
            text = " ".join(
                block["data"]["text"]
                for block in content_data.get("blocks", [])
                if block["type"] == "paragraph"
            )
            words = text.split()
            return " ".join(words[:word_limit]) + (
                "..." if len(words) > word_limit else ""
            )
        except (json.JSONDecodeError, KeyError, TypeError):
            return ""

    def process_image(self, image_field, size_type, max_dimension):
        img = Image.open(image_field)

        # Resize the image
        if max(img.size) > max_dimension:
            img.thumbnail((max_dimension, max_dimension), Image.ANTIALIAS)

        # Save WEBP version
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

        # Convert to RGB if the image has an alpha channel
        if img.mode in ("RGBA", "LA"):
            background = Image.new("RGB", img.size, (255, 255, 255))
            background.paste(img, mask=img.split()[3])  # Use alpha channel as mask
            img = background

        # Save JPEG version
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

    def get_absolute_url(self):
        return reverse("blog:blog_detail", kwargs={"slug": self.slug})

    def __str__(self):
        return self.title
