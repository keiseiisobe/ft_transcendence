from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout, get_user_model
from django.contrib.auth.forms import UserCreationForm
from django.urls import reverse_lazy
from django.http import HttpResponse, JsonResponse, HttpResponseNotFound, HttpResponseForbidden
from django.core.exceptions import ValidationError
import json

# Create your views here.

def mysignup(request):
    if request.method == "POST":
        try :
            avatar = request.POST["avatar"]
            username = request.POST["username"]
            password = request.POST["password"]
            User = get_user_model()
            User.objects.create_user(username=username, password=password, avatar=avatar)
        except ValidationError:
            return HttpResponseForbidden()
        return HttpResponse()

def mylogin(request):
    if request.method == "POST":
        username = request.POST["username"]
        password = request.POST["password"]
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

