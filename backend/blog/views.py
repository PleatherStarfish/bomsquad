from django.shortcuts import render, get_object_or_404
from .models import BlogPost
from django.core.paginator import Paginator


def blog_list(request):
    posts = BlogPost.objects.all().order_by("-datetime_created")
    paginator = Paginator(posts, 10)
    page_number = request.GET.get("page")
    page_obj = paginator.get_page(page_number)
    return render(request, "blog/blog_list.html", {"page_obj": page_obj})


def blog_detail(request, slug):
    post = get_object_or_404(BlogPost, slug=slug)
    related_posts = BlogPost.objects.filter(
        categories__in=post.categories.all()
    ).exclude(id=post.id)[:3]
    return render(
        request,
        "blog/blog_detail.html",
        {"post": post, "related_posts": related_posts},
    )
