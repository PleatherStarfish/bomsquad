from django_comments_xtd.models import XtdComment
from django.db import models


class CustomXtdComment(models.Model):
    comment = models.OneToOneField(XtdComment, on_delete=models.CASCADE)
    comment_url = models.URLField(max_length=500, blank=True, null=True)

    class Meta:
        app_label = "comments"
