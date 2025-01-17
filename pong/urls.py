from django.urls import path
from . import views

app_name = "pong"

urlpatterns = [
    path('', views.index, name="index"),
    path('login.html', views.login_page, name="login_page"),
    path('signup.html', views.signup_page, name="signup_page"),
    path('mypage/', views.mypage, name="mypage")
]
