from django.urls import path
from . import views

app_name = "matches"

urlpatterns = [
    path("new", views.matches_new, name="matches_new"),
    path("<int:id>", views.matches_details, name="matches_details"),
    path("tournaments/new", views.tournaments_new, name="tournaments_new"),
    path("tournaments/<int:id>", views.tournaments_details, name="tournaments_details"),
    path("tournaments/<int:id>/next-match", views.tournaments_next_match, name="tournaments_next_match"),
    path("tournaments/<int:id>/results", views.tournaments_results, name="tournaments_results"),


    path("newMatch/", views.new_match, name="new_match"),
    path("score", views.get_match_score, name="get_match_score"),
    path("update-score/", views.update_match_score, name="update_match_score"),
    path("newTournament/", views.new_tournament, name="new_tournament"),
    path("next-tournament-match", views.next_tournament_match, name="next_tournament_match")
]
