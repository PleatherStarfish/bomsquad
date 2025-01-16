from django.contrib import admin
from mptt.admin import MPTTModelAdmin
from .models import BlogPost, Category


class CategoryAdmin(MPTTModelAdmin):
    model = Category


class BlogPostAdmin(admin.ModelAdmin):
    model = BlogPost


# Registering models with the admin
admin.site.register(Category, CategoryAdmin)
admin.site.register(BlogPost, BlogPostAdmin)
