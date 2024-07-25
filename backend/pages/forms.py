from django import forms
from .models import StaticPage
from django_editorjs_fields import EditorJsWidget


class StaticPageForm(forms.ModelForm):
    class Meta:
        model = StaticPage
        fields = ["title", "content"]
        widgets = {"content": EditorJsWidget(config={"minHeight": 300})}
