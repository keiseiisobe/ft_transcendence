from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.contrib.staticfiles.testing import StaticLiveServerTestCase
from selenium.webdriver.common.by import By
from selenium import webdriver
from selenium.webdriver.chrome.service import Service

# Create your tests here.
import os
os.environ['DJANGO_LIVE_TEST_SERVER_ADDRESS'] = 'web:8081'

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
        cls.host = "localhost"
        cls.port = 8081
        super().setUpClass()
        options = webdriver.ChromeOptions()
        options.add_argument('--no-sandbox')
        cls.selenium = webdriver.Remote(command_executor="http://selenium:4444/wd/hub", options=options)
        cls.selenium.implicitly_wait(10)
        '''
        chromedriver_path = "/usr/bin/chromedriver"
        service = Service(chromedriver_path)
        options = webdriver.ChromeOptions()
        options.add_argument('--disable-gpu')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')        
        options.add_argument('--user-data-dir=/tmp')        
        options.add_argument('--headless')
        cls.selenium = webdriver.Chrome(service=service, options=options)
        cls.selenium.implicitly_wait(10)
        '''
        
    @classmethod
    def tearDownClass(cls):
        cls.selenium.quit()
        super().tearDownClass()

    def test_signup_and_login(self):
        print(f"{self.live_server_url}")
        self.selenium.get(f"http://web:8081/pong/")
        self.assertEqual(self.selenium.title, "Pong Game")
        username = "kisobe"
        password = "password"
        
        # signup
        signupModalButton = self.selenium.find_element(By.ID, "signup-modal-button")
        self.assertIn("Signup", signupModalButton.get_attribute("textContent"))
        signupModalButton.click()
        self.selenium.implicitly_wait(10)
        signupUsername = self.selenium.find_element(By.CSS_SELECTOR, "#signup-username")
        signupUsername.send_keys(username)
        signupPassword = self.selenium.find_element(By.CSS_SELECTOR, "#signup-password")
        signupPassword.send_keys(password)
        signupButton = self.selenium.find_element(By.CSS_SELECTOR, "#signup-button")
        signupButton.click()
        self.selenium.implicitly_wait(10)

        # login
        loginUsername = self.selenium.find_element(By.CSS_SELECTOR, "#login-username")
        loginUsername.send_keys(username)
        loginPassword = self.selenium.find_element(By.CSS_SELECTOR, "#login-password")
        loginPassword.send_keys(password)
        loginButton = self.selenium.find_element(By.CSS_SELECTOR, "#login-button")
        loginButton.click()

        self.selenium.implicitly_wait(10)
        header = self.selenium.find_element(By.CSS_SELECTOR, "#loaded-header")
        self.assertIn("Mypage", header.get_attribute("innerText"))
