from django.contrib.auth.forms import UserCreationForm as UserCreationFormBase
from django.contrib.auth.forms import UserChangeForm as UserChangeFormBase
from django.forms import ModelForm

from .models import User

class UserCreationForm(UserCreationFormBase):
    class Meta: # pyright: ignore [reportIncompatibleVariableOverride]
        model = User
        fields = UserCreationFormBase.Meta.fields + ("avatar",)

class UserChangeForm(UserChangeFormBase):
    class Meta: # pyright: ignore [reportIncompatibleVariableOverride]
        model = User
        fields = UserCreationFormBase.Meta.fields + ("avatar",)

class UserChangeUsernameForm(ModelForm):
    class Meta:
        model = User
        fields = ("username",)
