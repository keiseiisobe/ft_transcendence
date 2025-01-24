from django.shortcuts import render
from django.views.generic import CreateView
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import UserCreationForm
from django.urls import reverse_lazy
from django.http import JsonResponse, HttpResponseNotFound
import json

# Create your views here.

def mysignup(request):
    pass

def mylogin(request):
    if request.method == "POST":
        jsonData = json.loads(request.body)
        username = jsonData.get("username")
        password = jsonData.get("password")
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return render(request, "pong/header.html", { "user": request.user })
        else:
            return HttpResponseNotFound()

def mylogout(request):
    logout(request)
    return render(request, "pong/header.html", { "user": request.user })

def mypage(request):
    return render(request, "accounts/mypage.html", { "user": request.user })

