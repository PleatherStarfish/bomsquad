from django.contrib import admin
from .models import CustomXtdComment


class CustomXtdCommentAdmin(admin.ModelAdmin):
    list_display = ("id", "comment_url")


admin.site.register(CustomXtdComment, CustomXtdCommentAdmin)
