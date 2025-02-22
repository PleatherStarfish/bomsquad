from django.urls import path, register_converter
from blog import views

app_name = "blog"

urlpatterns = [
    path("", views.blog_list, name="blog_list"),  # Blog list page
    path(
        "how-much-cheaper-is-diy/",
        views.blog_detail_diy_savings,
        name="blog_detail_diy_savings",
    ),  # Custom route
    path("category/<slug:category_slug>/", views.blog_list, name="category_posts"),
    path(
        "<slug:slug>/", views.blog_detail, name="blog_detail"
    ),  # Catch-all for other blog posts
]
