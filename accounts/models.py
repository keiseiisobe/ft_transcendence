from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager

# Create your models here.

class UserManager(BaseUserManager):
    pass

class User(AbstractBaseUser):
    username = models.CharField(max_length=40, unique=True)
    password = models.CharField(max_length=40)
    is_login = models.BooleanField(default=False)
    USERNAME_FIELD = "username"
    objects = UserManager()

