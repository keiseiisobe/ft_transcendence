from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.contrib.auth.password_validation import validate_password
from accounts.forms import UserChangeUsernameForm, UserCreationForm

# Create your tests here.

class UserModelTests(TestCase):
    def test_create_user(self):
        User = get_user_model()
        user = User.objects.create_user("thomas", password="12345")
        self.assertEqual(user.username, "thomas")
        self.assertIsNone(user.first_name)
        self.assertIsNone(user.last_name)
        self.assertIsNone(user.email)
        self.assertTrue(user.is_active)
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)

    def test_create_superuser(self):
        User = get_user_model()
        user = User.objects.create_superuser("thomas", password="12345")
        self.assertEqual(user.username, "thomas")
        self.assertIsNone(user.first_name)
        self.assertIsNone(user.last_name)
        self.assertIsNone(user.email)
        self.assertTrue(user.is_active)
        self.assertTrue(user.is_staff)
        self.assertTrue(user.is_superuser)

    def test_username_must_not_be_empty(self):
        User = get_user_model()
        username = ""
        password = "password"
        with self.assertRaises(ValueError):
            User.objects.create_user(username=username, password=password)

    def test_username_must_not_be_null(self):
        User = get_user_model()
        username = None
        password = "password"
        with self.assertRaises(ValueError):
            User.objects.create_user(username=username, password=password)
            
    def test_password_must_not_be_empty(self):
        User = get_user_model()
        username = "kisobe"
        password = ""
        with self.assertRaises(ValueError):
            User.objects.create_user(username=username, password=password)

    def test_password_must_not_be_null(self):
        User = get_user_model()
        username = "kisobe"
        password = None
        with self.assertRaises(ValueError):
            User.objects.create_user(username=username, password=password)

class PasswordValidationTests(TestCase):
    def test_password_validation(self):
        password = 'A' * 5
        validate_password(password)

    def test_password_must_be_more_than_5_len(self):
        password = 'A' * 4
        with self.assertRaises(ValidationError):
            validate_password(password)

class CreationFormValidationTests(TestCase):
    def test_user_create_form(self):
        form_data = {
            "username": "thomas",
            "password1": "12345",
            "password2": "12345",
        }
        form = UserCreationForm(data=form_data)
        self.assertTrue(form.is_valid())

    def test_different_passwords(self):
        form_data = {
            "username": "thomas",
            "password1": "12345",
            "password2": "abcde",
        }
        form = UserCreationForm(data=form_data)
        self.assertFalse(form.is_valid())

    def test_password_must_be_more_than_5_len(self):
        form_data = {
            "username": "thomas",
            "password1": 'A' * 4,
            "password2": 'A' * 4,
        }
        form = UserCreationForm(data=form_data)
        self.assertFalse(form.is_valid())

    def test_username_must_not_contain_japanese(self):
        form_data = {
            "username": "トーマス",
            "password1": '12345',
            "password2": '12345',
        }
        form = UserCreationForm(data=form_data)
        self.assertFalse(form.is_valid())

    def test_username_must_be_unique(self):
        form_data = {
            "username": "thomas",
            "password1": "12345",
            "password2": "12345",
        }
        form1 = UserCreationForm(data=form_data)
        self.assertTrue(form1.is_valid())
        form1.save()

        form2 = UserCreationForm(data=form_data)
        self.assertFalse(form2.is_valid())

    def test_username_must_be_unique_case_insensitive(self):
        form_data = {
            "username": "thomas",
            "password1": "12345",
            "password2": "12345",
        }
        form1 = UserCreationForm(data=form_data)
        self.assertTrue(form1.is_valid())
        form1.save()

        form_data["username"] = 'THOMAS'

        form2 = UserCreationForm(data=form_data)
        self.assertFalse(form2.is_valid())

class ChangeUsernameFormTests(TestCase):
    def setUp(self):
        form_data = {
            "username": "thomas",
            "password1": "12345",
            "password2": "12345",
        }
        form = UserCreationForm(data=form_data)
        self.assertTrue(form.is_valid())
        self.user = form.save()
        self.assertEqual(self.user.username, "thomas")

    def test_user_change_username_form(self):
        form_data = {
            "username": "patrick",
        }
        form = UserChangeUsernameForm(data=form_data, instance=self.user)
        self.assertTrue(form.is_valid())
        self.user = form.save()
        self.assertEqual(self.user.username, "patrick")

        form_data = {
            "username": "thomas",
        }
        form = UserChangeUsernameForm(data=form_data, instance=self.user)
        self.assertTrue(form.is_valid())
        self.user = form.save()
        self.assertEqual(self.user.username, "thomas")

    def test_username_must_not_contain_japanese(self):
        form_data = {
            "username": "トーマス",
        }
        form = UserChangeUsernameForm(data=form_data, instance=self.user)
        self.assertFalse(form.is_valid())

    def test_username_must_be_unique(self):
        form1_data = {
            "username": "patrick",
            "password1": "12345",
            "password2": "12345",
        }
        form1 = UserCreationForm(data=form1_data)
        self.assertTrue(form1.is_valid())
        form1.save()

        form2_data = {
            "username": "patrick",
        }
        form2 = UserChangeUsernameForm(data=form2_data, instance=self.user)
        self.assertFalse(form2.is_valid())

    def test_username_must_be_unique_case_insensitive(self):
        form1_data = {
            "username": "patrick",
            "password1": "12345",
            "password2": "12345",
        }
        form1 = UserCreationForm(data=form1_data)
        self.assertTrue(form1.is_valid())
        form1.save()

        form2_data = {
            "username": "PATRICK",
        }
        form2 = UserChangeUsernameForm(data=form2_data, instance=self.user)
        self.assertFalse(form2.is_valid())
