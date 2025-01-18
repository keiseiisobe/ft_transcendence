from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin

# Create your models here.

class User(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(max_length=40, unique=True)
    password = models.CharField(max_length=40)
    is_login = models.BooleanField(default=False)
    USERNAME_FIELD = "username"
    
