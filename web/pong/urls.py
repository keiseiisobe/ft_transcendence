from django.urls import path
from . import views

app_name = "pong"

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login, name="login"),
    path("signup", views.signup, name="signup"),

    path("dev/login-modal", views.login_modal, name="login-modal"), # TODO : remove
    path("dev/signup-modal", views.signup_modal, name="signup-modal") # TODO : remove
]
