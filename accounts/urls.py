from django.urls import path
from . import views

app_name = "accounts"

urlpatterns = [
    path('signup/', views.mysignup, name="signup"),
    path('login/', views.mylogin, name="login"),
    path('logout/', views.mylogout, name="logout"),
    path('mypage/', views.mypage, name="mypage"),
    path('mypage/close/', views.mypageClose, name="mypageClose"),
    path('images/<path:filename>', views.images, name="images"),
    path('edit/username/', views.editUsername, name="editUsername"),
    path('edit/password/', views.editPassword, name="editPassword"),
    path('edit/avatar/', views.editAvatar, name="editAvatar"),
    path('friend/add/', views.addFriend, name="addFriend"),
    path('generate_qr/<str:username>/', views.generate_qr, name='generate_qr'),
    path('totp-login/', views.totpLogin, name="totpLogin"),
]
