from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from .models import MatchHistory

# Create your views here.
def index(request):
    return render(request, "pong/index.html")

def header(request):
    return render(request, "pong/header.html", { "user": request.user })

def gameover(request):
    if request.method == "POST" and request.user.is_authenticated:
        opponent = request.POST["opponent"]
        score_user = request.POST["score_user"]
        score_opponent = request.POST["score_opponent"]
        result = request.POST["result"]
        request.user.matchhistory_set.create(opponent=opponent, score_user=score_user, score_opponent=score_opponent, result=result)
    return render(request, "pong/pong.html", { "user": request.user })
    
