from django.db import models
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.core.exceptions import ValidationError, ObjectDoesNotExist

# Create your models here.

class UserManager(BaseUserManager):
    def create_user(self, username, password=None):
        User = get_user_model()
        user = User(username=username)
        user.set_password(password)
        user.clean()
        user.save()
        return user

class User(AbstractBaseUser):
    username = models.CharField(max_length=40, unique=True)
    password = models.CharField(max_length=40)
    is_login = models.BooleanField(default=False)
    USERNAME_FIELD = "username"
    objects = UserManager()
    def clean(self):
        User = get_user_model()
        try:
            User.objects.get(username=self.username)
        except ObjectDoesNotExist:
            return
        raise ValidationError("")
    
