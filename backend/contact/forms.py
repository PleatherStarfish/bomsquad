from django import forms
from crispy_forms.helper import FormHelper
from crispy_forms.layout import Layout, Submit
from captcha.fields import ReCaptchaField


class ContactForm(forms.Form):
    name = forms.CharField(max_length=100)
    email = forms.EmailField()
    message = forms.CharField(widget=forms.Textarea)
    honeypot = forms.CharField(
        required=False, widget=forms.TextInput(attrs={"style": "display:none"})
    )
    captcha = ReCaptchaField()

    def __init__(self, *args, **kwargs):
        super(ContactForm, self).__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.layout = Layout(
            "name",
            "email",
            "message",
            Submit(
                "submit",
                "Submit",
                css_class="px-4 py-2 mt-4 font-bold text-white rounded-full bg-brandgreen-500 hover:bg-brandgreen-700",
            ),
        )
