from django import forms
from tinymce.widgets import TinyMCE
from .models import Page


class PageForm(forms.ModelForm):
    class Meta:
        model = Page
        fields = ["title", "content"]
        widgets = {"content": TinyMCE(attrs={"cols": 80, "rows": 30})}
