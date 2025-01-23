from django.contrib.sitemaps import Sitemap
from django.urls import reverse
from blog.models import BlogPost
from modules.models import Module, Manufacturer
from components.models import Component, Types


class ProjectSitemap(Sitemap):
    changefreq = "weekly"
    priority = 0.7

    def items(self):
        return Module.objects.filter(discontinued=False)

    def lastmod(self, obj):
        return obj.datetime_updated  # Update to the correct timestamp field


class ManufacturerSitemap(Sitemap):
    changefreq = "monthly"
    priority = 0.6

    def items(self):
        return Manufacturer.objects.all()

    def location(self, obj):
        return reverse("manufacturer_detail", args=[obj.slug])

    def lastmod(self, obj):
        return obj.datetime_updated  # Ensure this field exists


class ComponentSitemap(Sitemap):
    changefreq = "daily"
    priority = 0.8

    def items(self):
        return Component.objects.filter(discontinued=False)

    def lastmod(self, obj):
        return obj.datetime_updated  # Update to the correct field


class StaticViewSitemap(Sitemap):
    changefreq = "monthly"
    priority = 0.4

    def items(self):
        return ["about", "disclaimer", "tos", "pp", "faq"]

    def location(self, item):
        return reverse(item)


class BlogSitemap(Sitemap):
    changefreq = "weekly"
    priority = 0.9

    def items(self):
        return BlogPost.objects.filter(published=True).order_by("-datetime_updated")

    def lastmod(self, obj):
        return obj.datetime_updated

    def location(self, obj):
        return reverse("blog:blog_detail", args=[obj.slug])
