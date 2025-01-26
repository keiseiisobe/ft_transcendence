from django.urls import path
from . import views

app_name = "accounts"

urlpatterns = [
    path('signup/', views.mysignup, name="signup"),
    path('login/', views.mylogin, name="login"),
    path('logout/', views.mylogout, name="logout"),
    path('mypage/', views.mypage, name="mypage"),
    path('images/<path:filename>', views.images, name="images"),
    path('edit/username/', views.editUsername, name="editUsername"),
    path('edit/password/', views.editPassword, name="editPassword"),
    path('edit/avatar/', views.editAvatar, name="editAvatar")
]
