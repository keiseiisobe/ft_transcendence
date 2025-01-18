from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from .models import MatchHistory

# Create your views here.
def index(request):
    return render(request, "pong/index.html")

def gameover(request, opponent, score_1, score_2, result):
    if request.user.is_authenticated:
        request.user.matchhistory_set.create(opponent=opponent, score_1=score_1, score_2=score_2, result=result)
    return HttpResponseRedirect(reverse("pong:index"))
    
