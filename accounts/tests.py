from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.contrib.staticfiles.testing import StaticLiveServerTestCase
from selenium.webdriver.common.by import By
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import socket

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


class SeleniumTest(StaticLiveServerTestCase):
    @classmethod
    def setUpClass(cls):
        cls.host = socket.gethostbyname(socket.gethostname())
        cls.port = 8081
        super().setUpClass()
        options = webdriver.ChromeOptions()
        options.add_argument('--no-sandbox')
        cls.selenium = webdriver.Remote(command_executor="http://selenium:4444/wd/hub", options=options)
        cls.selenium.set_window_size(1280, 832)
        print(f"Live Server: {cls.live_server_url}")
        cls.selenium.implicitly_wait(10)
        
    @classmethod
    def tearDownClass(cls):
        cls.selenium.quit()
        super().tearDownClass()

    def test_signup_and_login_and_logout(self):
        self.selenium.get(f"{self.live_server_url}/pong/")
        self.assertEqual(self.selenium.title, "Pong Game")
        username = "kisobe"
        password = "password"
        
        # signup
        signupModalButton = WebDriverWait(self.selenium, 50).until(
            EC.element_to_be_clickable((By.ID, "signup-modal-button"))
        )
        signupModalButton.click()
        signupUsername = WebDriverWait(self.selenium, 50).until(
            EC.element_to_be_clickable((By.ID, "signup-username"))
        )
        signupUsername.send_keys(username)
        signupPassword = self.selenium.find_element(By.ID, "signup-password")
        signupPassword.send_keys(password)
        signupButton = self.selenium.find_element(By.ID, "signup-button")
        signupButton.click()

        # login
        loginUsername = WebDriverWait(self.selenium, 50).until(
            EC.element_to_be_clickable((By.ID, "login-username"))
        )
        loginUsername.send_keys(username)
        loginPassword = self.selenium.find_element(By.ID, "login-password")
        loginPassword.send_keys(password)
        loginButton = self.selenium.find_element(By.ID, "login-button")
        loginButton.click()

        logoutButton = WebDriverWait(self.selenium, 50).until(
            EC.element_to_be_clickable((By.ID, "logout-button"))
        )
        self.assertEqual(logoutButton.get_attribute("value"), "Logout")

        #logout
        logoutButton.click()
        signupModalButton = WebDriverWait(self.selenium, 50).until(
            EC.element_to_be_clickable((By.ID, "signup-modal-button"))
        )
        self.assertEqual(signupModalButton.get_attribute("id"), "signup-modal-button")
