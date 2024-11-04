from django.db import models
from django_editorjs_fields import EditorJsJSONField


class StaticPage(models.Model):
    title = models.CharField(max_length=255)
    content = EditorJsJSONField(
        plugins=[
            "@editorjs/image",
            "@editorjs/header",
            "editorjs-github-gist-plugin",
            "@editorjs/code@2.6.0",
            "@editorjs/list@latest",
            "@editorjs/inline-code",
            "@editorjs/table",
        ],
        tools={
            "Gist": {"class": "Gist"},
            "Image": {
                "config": {"endpoints": {"byFile": "/editorjs/image_upload/"}},
                "inlineToolbar": True,
            },
        },
        null=True,
        blank=True,
    )

    def __str__(self):
        return self.title
