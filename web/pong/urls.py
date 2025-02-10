from django.urls import path
from . import views

app_name = "pong"

urlpatterns = [
    path('', views.index, name="index"),
    path('header.html', views.header, name="header"),
    path('gameover/', views.gameover, name="gameover")
]
