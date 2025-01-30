from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError

# Create your tests here.

class UserModelTests(TestCase):
    def test_username_must_not_be_empty(self):
        User = get_user_model()
        username = ""
        password = "password"
        with self.assertRaises(ValidationError, msg="Username cannot be empty"):
            User.objects.create_user(username=username, password=password)

        user = User(username="")
        with self.assertRaises(ValidationError, msg="Username cannot be empty"):
            user.clean()
            
    def test_password_must_not_be_empty(self):
        User = get_user_model()
        username = "kisobe"
        password = ""
        with self.assertRaises(ValidationError):
            User.objects.create_user(username=username, password=password)
            
    def test_password_must_be_more_than_5_len(self):
        User = get_user_model()
        username = "kisobe"
        password = "aaaa"
        with self.assertRaises(ValidationError):
            User.objects.create_user(username=username, password=password)
            
    def test_password_must_not_be_empty(self):
        User = get_user_model()
        username = "kisobe"
        password = ""
        with self.assertRaises(ValidationError):
            User.objects.create_user(username=username, password=password)
            
