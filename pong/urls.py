from django.urls import path
from . import views

app_name = "pong"

urlpatterns = [
    path('', views.index, name="index"),
    path('gameover/<opponent>/<int:score_1>/<int:score_2>/<int:result>/', views.gameover, name="gameover")
]
