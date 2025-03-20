from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.contrib.auth.validators import ASCIIUsernameValidator
from django.utils.translation import gettext_lazy as gl

class UserManager(ExportModelOperationsMixin('user-manager'), BaseUserManager):
    def create_user(self, username: str , password: str, avatar = None):
        if not username:
            raise ValueError(gl("Users must have a username"))
        if not password:
            raise ValueError(gl("Users must have a password"))
        user = self.model(username=username)
        user.set_password(password)
        if avatar:
            user.avatar = avatar
        user.save(using=self._db)
        return user

    def create_superuser(self, username: str, password: str):
        user = self.create_user(username, password)
        user.is_superuser = True
        user.is_staff = True
        user.save(using=self._db)
        return user

class User(ExportModelOperationsMixin('user'), AbstractBaseUser):
    username_validator = ASCIIUsernameValidator()

    username = models.CharField(
        gl("username"),
        max_length=40,
        unique=True,
        help_text=gl("Required. 40 characters or fewer. Letters, digits and @/./+/-/_ only."),
        validators=[ username_validator ],
        error_messages={ "unique": gl("A user with that username already exists.") },
    )
    first_name = None
    last_name = None
    email = None
    avatar = models.ImageField(upload_to="images", blank=True)
    is_login = models.BooleanField(default=False) # type: ignore

    EMAIL_FIELD = None
    REQUIRED_FIELDS = []

    objects = UserManager()

    def clean(self):
        super().clean()
        if self.username:
            self.username = self.get_username().lower()

    def __str__(self):
        return self.username
