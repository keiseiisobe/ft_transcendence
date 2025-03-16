from django.urls import path
from . import views

app_name = "matches"

urlpatterns = [
    path("new", views.matches_new, name="matches_new"),
    path("<int:match_id>", views.matches_details, name="matches_details"),
    path("tournaments/new", views.tournaments_new, name="tournaments_new"),
    path("tournaments/<int:tournament_id>", views.tournaments_details, name="tournaments_details"),
    path("tournaments/<int:tournament_id>/next-match", views.tournaments_next_match, name="tournaments_next_match"),
    path("tournaments/<int:tournament_id>/results", views.tournaments_results, name="tournaments_results"),
]
