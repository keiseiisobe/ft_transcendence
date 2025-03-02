from django.db import DataError
from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout, get_user_model
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.password_validation import validate_password
from django.urls import reverse_lazy
from django.http import HttpResponse, JsonResponse, FileResponse, HttpResponseNotFound, HttpResponseForbidden
from django.core.exceptions import ValidationError, ObjectDoesNotExist
from friendship.models import Friend, Follow
from friendship.exceptions import AlreadyExistsError
from pong.models import MatchHistory
import json, os

# Create your views here.

def mysignup(request):
    if request.method == "POST":
        try :
            User = get_user_model()
            username = request.POST["username"]
            password = request.POST["password"]
            avatar = request.FILES.get("avatar", False)
            if avatar:
                User.objects.create_user(username=username, password=password, avatar=avatar)
            else:
                User.objects.create_user(username=username, password=password)
        except ValidationError as e:
            return HttpResponseForbidden("\n".join(e))
        except DataError as e:
            return HttpResponseForbidden(e)
        return HttpResponse()

def mylogin(request):
    if request.method == "POST":
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            request.user.is_login = True
            request.user.save()
            return render(request, "pong/header.html", { "user": request.user })
        else:
            return HttpResponseNotFound("Username or password is incorrect")
        
def mylogout(request):
    request.user.is_login = False;
    request.user.save()
    logout(request)
    return render(request, "pong/header.html", { "user": request.user })

def mypage(request):
    friendList = Follow.objects.following(request.user)
    wins = request.user.matchhistory_set.filter(result=1).count()
    loses = request.user.matchhistory_set.filter(result=0).count()
    matches = request.user.matchhistory_set.all().order_by("-id")
    return render(request, "accounts/mypage.html",
                  { "user": request.user,
                    "friend_list": friendList,
                    "wins": wins,
                    "loses": loses,
                    "matches": matches })

def mypageClose(request):
    return render(request, "pong/pong.html", { "user": request.user })

def editUsername(request):
    if request.method == "POST":
        try:
            username = request.POST["username"]
            request.user.username = username
            request.user.clean()
            request.user.save()
            return HttpResponse()
        except ValidationError as e:
            return HttpResponseForbidden("\n".join(e))
    return HttpResponseForbidden()
    
def editPassword(request):
    if request.method == "POST":
        try:
            password = request.POST["password"]
            validate_password(password=password)
            request.user.set_password(password)
            request.user.save()
            logout(request)
            return render(request, "pong/pong.html", { "user": request.user })
        except ValidationError as e:
            return HttpResponseForbidden("\n".join(e))
    return HttpResponseForbidden()

def editAvatar(request):
    if request.method == "POST":
        avatar = request.FILES.get("avatar", False)
        if avatar == False:
            return HttpResponseForbidden("Avatar cannot be empty.")
        if request.user.avatar:
            os.remove(request.user.avatar.path)
        request.user.avatar = avatar
        request.user.save()
        return JsonResponse({ "url": request.user.avatar.url })
    return HttpResponseForbidden()
    
def addFriend(request):
    if request.method == "POST":
        try:
            friendname = request.POST["friendname"]
            User = get_user_model()
            friend = User.objects.get(username=friendname)
            Follow.objects.add_follower(request.user, friend)
            request.user.save()
            friendList = Follow.objects.following(request.user)
            return render(request, "accounts/friends.html", { "friend_list": friendList })
        except ObjectDoesNotExist:
            return HttpResponseNotFound("No such user.")
        except AlreadyExistsError as e:
            return HttpResponseForbidden("You have already requested friendship.")
        except ValidationError as e:
            return HttpResponseForbidden("\n".join(e))
    return HttpResponseForbidden()
