from django.urls import path
from . import views

app_name = "pong"

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login, name="login"),
    path("signup", views.signup, name="signup"),
    path("mypage", views.mypage, name="mypage"),
    path("mypage/edit-avatar", views.edit_avatar, name="edit_avatar"),
    path("mypage/edit-username", views.edit_username, name="edit_username"),
    path("mypage/edit-password", views.edit_password, name="edit_password"),
    path("mypage/add-friend", views.add_friend, name="add_friend"),
    path("gameover/", views.gameover, name="gameover"),

    path("ssr/index", views.ssr_index, name="ssr-index"),
    path("ssr/mypage", views.ssr_mypage, name="ssr-mypage")
]
