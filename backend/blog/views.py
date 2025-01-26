from django.shortcuts import render, get_object_or_404
from .models import BlogPost, Category
from django.core.paginator import Paginator


def blog_list(request, category_slug=None):
    # Filter posts by category if category_slug is provided
    if category_slug:
        category = get_object_or_404(Category, slug=category_slug)
        posts = BlogPost.objects.filter(categories=category, published=True).order_by(
            "-datetime_created"
        )
    else:
        category = None
        posts = BlogPost.objects.filter(published=True).order_by("-datetime_created")

    # Paginate posts
    paginator = Paginator(posts, 10)  # Show 10 posts per page
    page_number = request.GET.get("page")
    page_obj = paginator.get_page(page_number)

    return render(
        request,
        "blog/blog_list.html",
        {
            "page_obj": page_obj,  # Paginated posts
            "category": category,  # Current category (if filtered)
            "categories": Category.objects.all(),  # For category navigation
            "total_posts": posts.count(),  # Total number of posts
        },
    )


def blog_detail(request, slug):
    post = get_object_or_404(BlogPost, slug=slug)

    # Get related posts based on shared categories, excluding the current post
    related_posts = (
        BlogPost.objects.filter(categories__in=post.categories.all())
        .exclude(id=post.id)
        .distinct()[:3]
    )

    # Get categories associated with the current post
    categories = post.categories.all()

    return render(
        request,
        "blog/blog_detail.html",
        {
            "post": post,
            "related_posts": related_posts,
            "categories": categories,  # Pass the categories
        },
    )
