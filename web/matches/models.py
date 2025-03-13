from django.db import models
from channels.auth import get_user_model

# Create your models he.

class Tournament(models.Model):
    date = models.DateTimeField(auto_now_add=True)
    
    @property
    def is_finished(self):
        matches = self.matches.all()
        if not matches.exists():
            return False
        return all(match.is_finished for match in matches)

class Match(models.Model):
    PLAYER_TYPE_CHOICES = [(0, "User"), (1, "Guest"), (2, "AI")]

    p1_type = models.IntegerField(choices=PLAYER_TYPE_CHOICES)
    p1_nickname = models.CharField(max_length=10)
    p1_user = models.ForeignKey(get_user_model(), null=True, blank=True, on_delete=models.CASCADE, related_name="matches_as_p1")
    p1_score = models.IntegerField()

    p2_type = models.IntegerField(choices=PLAYER_TYPE_CHOICES)
    p2_nickname = models.CharField(max_length=10)
    p2_user = models.ForeignKey(get_user_model(), null=True, blank=True, on_delete=models.CASCADE, related_name="matches_as_p2")
    p2_score = models.IntegerField()

    tournament = models.ForeignKey(Tournament, null=True, blank=True, on_delete=models.CASCADE, related_name="matches")

    is_finished = models.BooleanField(default=False) # type: ignore
    date = models.DateTimeField(auto_now_add=True)

