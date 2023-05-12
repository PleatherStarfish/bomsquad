from django import forms
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from accounts.models import CustomUser
from allauth.account.forms import SignupForm


class CustomUserCreationForm(SignupForm):
    first_name = forms.CharField(max_length=55, label="First Name", required=False)
    last_name = forms.CharField(max_length=55, label="Last Name", required=False)

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
