from django.db import models
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.core.exceptions import ValidationError, ObjectDoesNotExist
from django.core.files import File
from django.contrib.auth.validators import ASCIIUsernameValidator

# Create your models here.

class UserManager(BaseUserManager):
    def create_user(self, username, password=None, avatar=None):
        User = get_user_model()
        user = User(username=username)
        user.clean()
        validate_password(password=password)
        user.set_password(password)
        if avatar:
            user.avatar = avatar
        else:
            user.avatar = File(open("accounts/images/gnu.png", "rb"))
        user.save()
        return user

class User(AbstractBaseUser):
    username = models.CharField(max_length=40, unique=True)
    password = models.CharField(max_length=40)
    avatar = models.ImageField(upload_to="accounts/images")
    is_login = models.BooleanField(default=False)
    USERNAME_FIELD = "username"
    objects = UserManager()
    def clean(self):
        User = get_user_model()
        try:
            if self.username == "":
                raise ValidationError("Username cannot be empty")
            User.objects.get(username=self.username)
        except ObjectDoesNotExist:
            return
        raise ValidationError("Username already exist. Try another username.")
