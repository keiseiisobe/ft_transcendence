from django.urls import path
from .views import SignUpView
from . import views

app_name = "accounts"

urlpatterns = [
    path('signup/', SignUpView.as_view(), name="signup"),
    path('mypage/', views.mypage, name="mypage")
]
