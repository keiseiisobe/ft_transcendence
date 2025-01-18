from django.urls import path
from .views import SignUpView, MyPageView

app_name = "accounts"

urlpatterns = [
    path('signup/', SignUpView.as_view(), name="signup"),
    path('mypage/', MyPageView.as_view(), name="mypage")
]
