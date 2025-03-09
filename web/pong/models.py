from channels.auth import get_user_model
from django.db import models

# Create your models here.
class MatchHistory(models.Model):
    user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    opponent = models.CharField(max_length=10)
    score_user = models.IntegerField()
    score_opponent = models.IntegerField()
    result = models.IntegerField() # 1 for Win, 0 for Lose
    date = models.DateTimeField(auto_now_add=True)
