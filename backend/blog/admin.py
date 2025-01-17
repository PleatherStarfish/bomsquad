from django.contrib import admin
from mptt.admin import MPTTModelAdmin
from .models import BlogPost, Category


class CategoryAdmin(MPTTModelAdmin):
    model = Category


class BlogPostAdmin(admin.ModelAdmin):
    model = BlogPost
    readonly_fields = (
        "thumb_image_webp",
        "thumb_image_jpeg",
        "large_image_webp",
        "large_image_jpeg",
    )


# Registering models with the admin
admin.site.register(Category, CategoryAdmin)
admin.site.register(BlogPost, BlogPostAdmin)
