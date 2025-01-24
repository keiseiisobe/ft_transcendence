from django.urls import path
from . import views

app_name = "accounts"

urlpatterns = [
    path('signup/', views.mysignup, name="signup"),
    path('login/', views.mylogin, name="login"),
    path('logout/', views.mylogout, name="logout"),
    path('mypage/', views.mypage, name="mypage"),
]
