from django.db import models
from django.utils import timezone


class BaseModel(models.Model):
    datetime_updated = models.DateTimeField(auto_now=True)
    datetime_created = models.DateTimeField(auto_now_add=True, blank=True, null=True)

    def save(self, *args, **kwargs):
        # Ensure `date_created` is only set on creation if not manually provided
        if not self.date_created:
            self.datetime_created = timezone.now()
        super().save(*args, **kwargs)

    class Meta:
        abstract = True
