from django.http import HttpResponse


def robots_txt(request):
    lines = [
        "User-agent: *",
        "Disallow: /admin/",
        "Disallow: /accounts/",
        "Disallow: /api/",
        "Disallow: /contact/",
        "Disallow: /user/",
    ]
    return HttpResponse("\n".join(lines), content_type="text/plain")
