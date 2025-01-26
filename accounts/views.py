from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout, get_user_model
from django.contrib.auth.forms import UserCreationForm
from django.urls import reverse_lazy
from django.http import HttpResponse, JsonResponse, FileResponse, HttpResponseNotFound, HttpResponseForbidden
from django.core.exceptions import ValidationError
import json, os

# Create your views here.

def mysignup(request):
    if request.method == "POST":
        try :
            avatar = request.FILES["avatar"]
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

def images(request, filename):
    try:
        path = "accounts/images/" + filename
        return FileResponse(open(path, "rb"))
    except FileNotFoundError:
        return HttpResponseNotFound()
    
def editUsername(request):
    if request.method == "POST":
        try:
            username = request.POST["username"]
            request.user.username = username
            request.user.clean()
            request.user.save()
            return HttpResponse()
        except ValidationError:
            return HttpResponseForbidden()
    return HttpResponseForbidden()
    
def editPassword(request):
    if request.method == "POST":
        password = request.POST["password"]
        request.user.set_password(password)
        request.user.save()
        logout(request)
        return render(request, "pong/pong.html", { "user": request.user })
    return HttpResponseForbidden()
    
def editAvatar(request):
    if request.method == "POST":
        avatar = request.FILES["avatar"]
        os.remove(request.user.avatar.path)
        request.user.avatar = avatar
        request.user.save()
        return JsonResponse({ "url": request.user.avatar.url })
    return HttpResponseForbidden()
    
