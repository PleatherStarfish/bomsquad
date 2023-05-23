from django.db import models


class BaseModel(models.Model):
    datetime_updated = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
