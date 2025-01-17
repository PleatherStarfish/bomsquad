from django.urls import path
from . import views

app_name = "blog"

urlpatterns = [
    path("", views.blog_list, name="blog_list"),  # Blog list page
    path("<slug:slug>/", views.blog_detail, name="blog_detail"),  # Blog detail page
]
