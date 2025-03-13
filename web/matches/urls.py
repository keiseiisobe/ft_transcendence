from django.urls import path
from . import views

app_name = "matches"

urlpatterns = [
    path("newMatch/", views.new_match, name="new_match"),
    path("score", views.get_match_score, name="get_match_score"),
    path("update-score/", views.update_match_score, name="update_match_score"),
    path("newTournament/", views.new_tournament, name="new_tournament"),
    path("next-tournament-match", views.next_tournament_match, name="next_tournament_match")
]
