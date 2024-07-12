from django.db.models.signals import post_save
from django.dispatch import receiver
from django_comments_xtd.models import XtdComment
from .models import CustomXtdComment


@receiver(post_save, sender=XtdComment)
def create_custom_xtd_comment(sender, instance, created, **kwargs):
    if created:
        content_object = instance.content_object
        comment_url = (
            content_object.get_absolute_url() + f"#c{instance.pk}"
            if content_object
            else None
        )
        CustomXtdComment.objects.create(comment=instance, comment_url=comment_url)
