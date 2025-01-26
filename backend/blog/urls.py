from django.urls import path
from . import views

app_name = "blog"

urlpatterns = [
    path("", views.blog_list, name="blog_list"),  # Blog list page
    path(
        "category/<slug:category_slug>/", views.blog_list, name="category_posts"
    ),  # Category-filtered posts
    path("<slug:slug>/", views.blog_detail, name="blog_detail"),  # Blog detail page
]
