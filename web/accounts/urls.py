from django.urls import path
from . import views

app_name = "accounts"

urlpatterns = [
    path('signup/', views.mysignup, name="signup"),
    path('login/', views.mylogin, name="login"),
    path('logout/', views.mylogout, name="logout"),
    path('edit/username/', views.editUsername, name="editUsername"),
    path('edit/password/', views.editPassword, name="editPassword"),
    path('edit/totp-off/', views.editTotpOff, name="editTotpOff"),
    path('edit/avatar/', views.editAvatar, name="editAvatar"),
    path('friend/add/', views.addFriend, name="addFriend"),
    path('user/', views.user, name="user"),
    path('generate_qr/', views.generate_qr, name='generate_qr'),
    path('verify-totp/', views.verifyTOTP, name="verifyTOTP"),
    path('verify-totp-code/', views.verifyTOTPcode, name="verifyTOTPcode")
]
