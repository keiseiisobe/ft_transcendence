from django.urls import path
from . import views

app_name = "pong"

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login, name="login"),
    path("signup", views.signup, name="signup"),
    path("mypage", views.mypage, name="mypage"),

    path("ssr/index", views.ssr_index, name="ssr-index"),
    path("ssr/mypage", views.ssr_mypage, name="ssr-mypage")
]
