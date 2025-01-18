from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class MatchHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    opponent = models.CharField(max_length=10)
    score_1 = models.IntegerField()
    score_2 = models.IntegerField()
    result = models.BooleanField() # True for Win, False for Lose
    date = models.DateField(auto_now_add=True)
