from django import forms
from django.contrib.auth.forms import UserChangeForm
from accounts.models import CustomUser
from allauth.account.forms import SignupForm, ResetPasswordForm
from captcha.fields import ReCaptchaField


class CustomUserCreationForm(SignupForm):
    first_name = forms.CharField(max_length=55, label="First Name", required=False)
    last_name = forms.CharField(max_length=55, label="Last Name", required=False)
    captcha = ReCaptchaField()

    class Meta:
        model = CustomUser
        fields = (
            "first_name",
            "last_name",
            "email",
            "username",
            "password1",
            "password2",
            "captcha",
        )

    def __init__(self, *args, **kwargs):
        super(CustomUserCreationForm, self).__init__(*args, **kwargs)
        self.order_fields(
            [
                "first_name",
                "last_name",
                "email",
                "username",
                "password1",
                "password2",
                "captcha",
            ]
        )

    def save(self, request):
        user = super(CustomUserCreationForm, self).save(request)
        user.first_name = self.cleaned_data["first_name"]
        user.last_name = self.cleaned_data["last_name"]
        user.save()
        return user


class CustomUserChangeForm(UserChangeForm):
    class Meta:
        model = CustomUser
        fields = (
            "email",
            "username",
        )


class CaptchaPasswordResetForm(ResetPasswordForm):
    captcha = ReCaptchaField()

    def __init__(self, *args, **kwargs):
        super(CaptchaPasswordResetForm, self).__init__(*args, **kwargs)
        # No need to explicitly add the captcha field here; it's already part of the form fields

    def save(self, request, **kwargs):
        # Call the parent class's save method
        email_address = super(CaptchaPasswordResetForm, self).save(request, **kwargs)

        # Add any additional processing here if needed

        # Return the original result
        return email_address
