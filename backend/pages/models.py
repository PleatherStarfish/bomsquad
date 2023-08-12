from django.db import models
from tinymce.models import HTMLField


# Create your models here.
class Page(models.Model):
    # id = models.BigAutoField(primary_key=True)
    title = models.CharField(max_length=100)
    content = HTMLField()

    def __str__(self):
        return self.title
