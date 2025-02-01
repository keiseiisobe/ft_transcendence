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

    # utils

    def signup(self, username, password):
        signupUsername = WebDriverWait(self.selenium, 10).until(
            EC.element_to_be_clickable((By.ID, "signup-username"))
        )
        signupUsername.send_keys(username)
        WebDriverWait(self.selenium, 10).until(
            EC.text_to_be_present_in_element_attribute((By.ID, "signup-username"), "value", username)
        )
        signupPassword = self.selenium.find_element(By.ID, "signup-password")
        signupPassword.send_keys(password)
        WebDriverWait(self.selenium, 10).until(
            EC.text_to_be_present_in_element_attribute((By.ID, "signup-password"), "value", password)
        )
        signupButton = self.selenium.find_element(By.ID, "signup-button")
        signupButton.click()

    def login(self, username, password):
        loginUsername = WebDriverWait(self.selenium, 10).until(
            EC.element_to_be_clickable((By.ID, "login-username"))
        )
        loginUsername.send_keys(username)
        WebDriverWait(self.selenium, 10).until(
            EC.text_to_be_present_in_element_attribute((By.ID, "login-username"), "value", username)
        )
        loginPassword = self.selenium.find_element(By.ID, "login-password")
        loginPassword.send_keys(password)
        WebDriverWait(self.selenium, 10).until(
            EC.text_to_be_present_in_element_attribute((By.ID, "login-password"), "value", password)
        )
        loginButton = self.selenium.find_element(By.ID, "login-button")
        loginButton.click()

    def logout(self):
        logoutButton = self.selenium.find_element(By.ID, "logout-button")
        logoutButton.click()
        signupModalButton = WebDriverWait(self.selenium, 10).until(
            EC.element_to_be_clickable((By.ID, "signup-modal-button"))
        )
        self.assertEqual(signupModalButton.get_attribute("id"), "signup-modal-button")

    def signup_prepare(self):
        signupModalButton = WebDriverWait(self.selenium, 10).until(
            EC.element_to_be_clickable((By.ID, "signup-modal-button"))
        )
        signupModalButton.click()

    def login_prepare(self):
        loginModalButton = WebDriverWait(self.selenium, 10).until(
            EC.element_to_be_clickable((By.ID, "login-modal-button"))
        )
        loginModalButton.click()
        
    def signup_ok(self):
        loginUsername = WebDriverWait(self.selenium, 10).until(
            EC.element_to_be_clickable((By.ID, "login-username"))
        )

    def signup_error(self, expected_message):
        error_message = WebDriverWait(self.selenium, 10).until(
            EC.visibility_of_element_located((By.CLASS_NAME, "signup-error-message"))
        )
        self.assertIn(expected_message, error_message.text)

    def login_ok(self):
        logoutButton = WebDriverWait(self.selenium, 10).until(
            EC.element_to_be_clickable((By.ID, "logout-button"))
        )
        self.assertEqual(logoutButton.get_attribute("value"), "Logout")

    def login_error(self, expected_message):
        error_message = WebDriverWait(self.selenium, 10).until(
            EC.visibility_of_element_located((By.CLASS_NAME, "login-error-message"))
        )
        self.assertIn(expected_message, error_message.text)

    def signup_close(self):
        closeButton = WebDriverWait(self.selenium, 10).until(
            EC.element_to_be_clickable((By.ID, "signup-close"))
        )
        closeButton.click()
        
    def login_close(self):
        closeButton = WebDriverWait(self.selenium, 10).until(
            EC.element_to_be_clickable((By.ID, "login-close"))
        )
        closeButton.click()
        self.selenium.implicitly_wait(50)

    def mypage(self):
        mypageButton = WebDriverWait(self.selenium, 10).until(
            EC.element_to_be_clickable((By.ID, "mypage-button"))
        )
        mypageButton.click()

    def mypage_close(self):
        closeButton = WebDriverWait(self.selenium, 10).until(
            EC.element_to_be_clickable((By.ID, "mypage-close"))
        )
        closeButton.click()

    def add_friend(self, username):
        modalButton = WebDriverWait(self.selenium, 10).until(
            EC.element_to_be_clickable((By.ID, "add-friend-modal-button"))
        )
        modalButton.click()
        requested_friend = WebDriverWait(self.selenium, 10).until(
            EC.element_to_be_clickable((By.ID, "requested-friend"))
        )
        requested_friend.send_keys(username)
        WebDriverWait(self.selenium, 10).until(
            EC.text_to_be_present_in_element_attribute((By.ID, "requested-friend"), "value", username)
        )
        button = self.selenium.find_element(By.ID, "add-friend-button")
        button.click()

    def add_friend_ok(self, username):
        friend_list = WebDriverWait(self.selenium, 10).until(
            EC.text_to_be_present_in_element((By.ID, "friend-list"), username)
        )
        self.assertTrue(friend_list)

    def add_friend_error(self, expected_message):
        error_message = WebDriverWait(self.selenium, 10).until(
            EC.visibility_of_element_located((By.CLASS_NAME, "add-friend-error-message"))
        )
        self.assertIn(expected_message, error_message.text)

    def edit_username(self, new_username):
        modalButton = WebDriverWait(self.selenium, 10).until(
            EC.element_to_be_clickable((By.ID, "edit-username-modal-button"))
        )
        modalButton.click()
        username = WebDriverWait(self.selenium, 10).until(
            EC.element_to_be_clickable((By.ID, "edit-username"))
        )
        username.send_keys(new_username)
        WebDriverWait(self.selenium, 10).until(
            EC.text_to_be_present_in_element_attribute((By.ID, "edit-username"), "value", new_username)
        )
        button = self.selenium.find_element(By.ID, "edit-username-button")
        button.click()

    def edit_username_ok(self, new_username):
        username = WebDriverWait(self.selenium, 10).until(
            EC.text_to_be_present_in_element((By.ID, "username"), new_username)
        )
        self.assertTrue(username)
        
    def edit_username_error(self, expected_message):
        error_message = WebDriverWait(self.selenium, 10).until(
            EC.visibility_of_element_located((By.CLASS_NAME, "edit-username-error-message"))
        )
        self.assertIn(expected_message, error_message.text)
        
    def edit_password(self, new_password):
        modalButton = WebDriverWait(self.selenium, 10).until(
            EC.element_to_be_clickable((By.ID, "edit-password-modal-button"))
        )
        modalButton.click()
        password = WebDriverWait(self.selenium, 10).until(
            EC.element_to_be_clickable((By.ID, "edit-password"))
        )
        password.send_keys(new_password)
        WebDriverWait(self.selenium, 10).until(
            EC.text_to_be_present_in_element_attribute((By.ID, "edit-password"), "value", new_password)
        )
        button = self.selenium.find_element(By.ID, "edit-password-button")
        button.click()

    def edit_password_ok(self, username, new_password):
        self.login(username, new_password)
        self.login_ok()
        
    def edit_password_error(self, expected_message):
        error_message = WebDriverWait(self.selenium, 10).until(
            EC.visibility_of_element_located((By.CLASS_NAME, "edit-password-error-message"))
        )
        self.assertIn(expected_message, error_message.text)
        
    #success test
    
    def test_signup_login_and_logout(self):
        self.selenium.get(f"{self.live_server_url}/pong/")
        self.assertEqual(self.selenium.title, "Pong Game")
        username = "kisobe"
        password = "password"
        self.signup_prepare()
        self.signup(username, password)
        self.login(username, password)
        self.login_ok()
        self.logout()

    def test_mypage(self):
        self.selenium.get(f"{self.live_server_url}/pong/")
        self.assertEqual(self.selenium.title, "Pong Game")
        username = "jyasukaw"
        password = "password"
        self.signup_prepare()
        self.signup(username, password)
        self.login(username, password)
        self.login_ok()
        self.mypage()
        displayed_username = WebDriverWait(self.selenium, 10).until(
            EC.visibility_of_element_located((By.ID, "username"))
        )
        self.assertEqual(displayed_username.text, username)
        self.mypage_close()
        self.logout()

    def test_add_friend(self):
        self.selenium.get(f"{self.live_server_url}/pong/")
        self.assertEqual(self.selenium.title, "Pong Game")
        friend = "jyasukaw"
        password = "password"
        self.signup_prepare()
        self.signup(friend, password)
        self.login(friend, password)
        self.login_ok()
        self.logout()
        username = "kousuzuk"
        self.signup_prepare()
        self.signup(username, password)
        self.login(username, password)
        self.login_ok()
        self.mypage()
        self.add_friend(friend)
        self.add_friend_ok(friend)

    def test_edit_username(self):
        self.selenium.get(f"{self.live_server_url}/pong/")
        self.assertEqual(self.selenium.title, "Pong Game")
        username = "kmotoyam"
        password = "kojikojikojikojikoji"
        self.signup_prepare()
        self.signup(username, password)
        self.login(username, password)
        self.login_ok()
        self.mypage()
        new_username = "koji"
        self.edit_username(new_username)
        self.edit_username_ok(new_username)

    def test_edit_password(self):
        self.selenium.get(f"{self.live_server_url}/pong/")
        self.assertEqual(self.selenium.title, "Pong Game")
        username = "kojwatan"
        password = "kojikojikojikojikoji"
        self.signup_prepare()
        self.signup(username, password)
        self.login(username, password)
        self.login_ok()
        self.mypage()
        new_password = "complexedpassword"
        self.edit_password(new_password)
        self.edit_password_ok(username, new_password)
        
    # failure test
    error_message = {
        "alreadyfriend": "You have already requested friendship.",
        "badpassword": "This password is too short",
        "cannotaddyouself": "Users cannot follow themselves",
        "incorrect": "Username or password is incorrect",
        "nosuchuser": "No such user.",
        "usernameempty": "Username cannot be empty",
        "usernameexist": "Username already exist. Try another username."
    }

    def test_username_is_empty(self):
        self.selenium.get(f"{self.live_server_url}/pong/")
        username = ""
        password = "I am empty."
        self.signup_prepare()
        self.signup(username, password)
        self.signup_error(self.error_message["usernameempty"])

    def test_password_is_empty(self):
        self.selenium.get(f"{self.live_server_url}/pong/")
        username = "baduser"
        password = ""
        self.signup_prepare()
        self.signup(username, password)
        self.signup_error(self.error_message["badpassword"])

    def test_password_is_shorter_than_5(self):
        self.selenium.get(f"{self.live_server_url}/pong/")
        username = "shortpassword"
        password = "four"
        self.signup_prepare()
        self.signup(username, password)
        self.signup_error(self.error_message["badpassword"])

    def test_login_without_signup(self):
        self.selenium.get(f"{self.live_server_url}/pong/")
        username = "notsignupyet"
        password = "letmelogin"
        self.login_prepare()
        self.login(username, password)
        self.login_error(self.error_message["incorrect"])

    def test_login_with_wrong_password(self):
        self.selenium.get(f"{self.live_server_url}/pong/")
        username = "forgotmypassword"
        password = "abracadabra"
        self.signup_prepare()
        self.signup(username, password)
        self.signup_ok()
        wrong_password = "abrakatabra"
        self.login(username, wrong_password)
        self.login_error(self.error_message["incorrect"])

    def test_signup_with_username_already_present(self):
        self.selenium.get(f"{self.live_server_url}/pong/")
        username = "resaito"
        password = "password"
        self.signup_prepare()
        self.signup(username, password)
        self.signup_ok()
        self.login(username, password)
        self.logout()
        self.signup_prepare()
        self.signup(username, password)
        self.signup_error(self.error_message["usernameexist"])

    def test_add_friend_not_registered(self):
        self.selenium.get(f"{self.live_server_url}/pong/")
        username = "resaito"
        password = "password"
        self.signup_prepare()
        self.signup(username, password)
        self.signup_ok()
        self.login(username, password)
        self.login_ok()
        self.mypage()
        friend = "jyasukaw"
        self.add_friend(friend)
        self.add_friend_error(self.error_message["nosuchuser"])

    def test_add_friend_myself(self):
        self.selenium.get(f"{self.live_server_url}/pong/")
        username = "nop"
        password = "password"
        self.signup_prepare()
        self.signup(username, password)
        self.signup_ok()
        self.login(username, password)
        self.mypage()
        self.add_friend(username)
        self.add_friend_error(self.error_message["cannotaddyouself"])
        
    def test_add_friend_already_requested(self):
        self.selenium.get(f"{self.live_server_url}/pong/")
        friend = "kojwatan"
        password = "password"
        self.signup_prepare()
        self.signup(friend, password)
        self.login(friend, password)
        self.logout()
        username = "hoyuki"
        self.signup_prepare()
        self.signup(username, password)
        self.login(username, password)
        self.mypage()
        self.add_friend(friend)
        self.add_friend_ok(friend)
        self.add_friend(friend)
        self.add_friend_error(self.error_message["alreadyfriend"])
        
    def test_edit_username_is_empty(self):
        self.selenium.get(f"{self.live_server_url}/pong/")
        self.assertEqual(self.selenium.title, "Pong Game")
        username = "ryanagit"
        password = "password"
        self.signup_prepare()
        self.signup(username, password)
        self.login(username, password)
        self.login_ok()
        self.mypage()
        new_username = ""
        self.edit_username(new_username)
        self.edit_username_error(self.error_message["usernameempty"])

    def test_edit_with_username_already_present(self):
        self.selenium.get(f"{self.live_server_url}/pong/")
        username1 = "resaito"
        password = "password"
        self.signup_prepare()
        self.signup(username1, password)
        self.signup_ok()
        self.login(username1, password)
        self.logout()
        username2 = "kousuzuk"
        self.signup_prepare()
        self.signup(username2, password)
        self.signup_ok()
        self.login(username2, password)
        self.login_ok()
        self.mypage()
        self.edit_username(username1)
        self.edit_username_error(self.error_message["usernameexist"])

    def test_edit_username_to_myself(self):
        self.selenium.get(f"{self.live_server_url}/pong/")
        username = "resaito"
        password = "password"
        self.signup_prepare()
        self.signup(username, password)
        self.signup_ok()
        self.login(username, password)
        self.login_ok()
        self.mypage()
        self.edit_username(username)
        self.edit_username_error(self.error_message["usernameexist"])

    def test_edit_password_is_empty(self):
        self.selenium.get(f"{self.live_server_url}/pong/")
        self.assertEqual(self.selenium.title, "Pong Game")
        username = "ryanagit"
        password = "password"
        self.signup_prepare()
        self.signup(username, password)
        self.login(username, password)
        self.login_ok()
        self.mypage()
        new_password = ""
        self.edit_password(new_password)
        self.edit_password_error(self.error_message["badpassword"])

    def test_edit_with_bad_password(self):
        self.selenium.get(f"{self.live_server_url}/pong/")
        self.assertEqual(self.selenium.title, "Pong Game")
        username = "ryanagit"
        password = "password"
        self.signup_prepare()
        self.signup(username, password)
        self.login(username, password)
        self.login_ok()
        self.mypage()
        new_password = "fooo"
        self.edit_password(new_password)
        self.edit_password_error(self.error_message["badpassword"])
