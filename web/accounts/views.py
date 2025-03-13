import os

from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout, get_user_model
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, HttpResponseBadRequest, JsonResponse, HttpResponseNotFound, HttpResponseForbidden
from django.core.exceptions import ValidationError, ObjectDoesNotExist
from django.views.decorators.http import require_http_methods

from friendship.models import Follow, bust_cache
from friendship.exceptions import AlreadyExistsError

from accounts.forms import UserChangeUsernameForm, UserCreationForm

# Create your views here.

@require_http_methods(["POST"])
def mysignup(request):
    form_data = {
        "username": request.POST.get("username", None),
        "password1": request.POST.get("password1", None),
        "password2": request.POST.get("password2", None),
        "avatar": request.FILES.get("avatar", None)
    }
    form = UserCreationForm(data=form_data, files=request.FILES)
    if not form.is_valid():
        return HttpResponseBadRequest() # TODO : return error description
    form.save()
    return JsonResponse({ "message": "OK" })

@require_http_methods(["POST"])
def mylogin(request):
    username = request.POST["username"]
    password = request.POST["password"]
    user = authenticate(request, username=username, password=password)
    if user is None:
        return HttpResponseBadRequest() # TODO : return error description
    login(request, user)
    request.user.is_login = True
    request.user.save()
    for user in Follow.objects.followers(request.user):
        bust_cache("following", user.pk)
    return JsonResponse({ "message": "OK" })

@login_required
@require_http_methods(["POST"])
def mylogout(request):
    request.user.is_login = False;
    request.user.save()
    for user in Follow.objects.followers(request.user):
        bust_cache("following", user.pk)
    logout(request)
    return JsonResponse({ "message": "OK" })

@login_required
@require_http_methods(["POST"])
def editUsername(request):
    form_data = {
        "username": request.POST.get("username", None),
    }
    form = UserChangeUsernameForm(data=form_data, instance=request.user)
    if not form.is_valid():
        return HttpResponseBadRequest() # TODO : return error description
    form.save()
    return JsonResponse({ "message": "OK" })
    
@login_required
@require_http_methods(["POST"])
def editPassword(request):
    try:
        password = request.POST["password"]
        validate_password(password=password)
        request.user.set_password(password)
        return mylogout(request)
    except ValidationError as e:
        return JsonResponse({ "message": e.messages }, status=400) # Todo better error description

@login_required
@require_http_methods(["POST"])
def editAvatar(request):
    avatar = request.FILES.get("avatar", False)
    if avatar == False:
        return JsonResponse({ "message": "Avatar cannot be empty." }, status=400)
    if request.user.avatar:
        os.remove(request.user.avatar.path)
    request.user.avatar = avatar
    request.user.save()
    return JsonResponse({ "message": "OK" })
    
@login_required
@require_http_methods(["POST"])
def addFriend(request):
    try:
        friendname = request.POST["friendname"]
        friend = get_user_model().objects.get(username=friendname)
        Follow.objects.add_follower(request.user, friend)
        request.user.save()
        return JsonResponse({ "message": "OK" })
    except ObjectDoesNotExist:
        return JsonResponse({ "message": "No such user." }, status=404)
    except AlreadyExistsError:
        return JsonResponse({ "message": "You have already requested friendship." }, status=400)
    except ValidationError as e:
        return JsonResponse({ "message": e.messages }, status=400)

@require_http_methods(["GET"])
def user(request):
    if request.user.is_authenticated:
        return JsonResponse({
            "username": request.user.username
        })
    else:
        return JsonResponse({"message": "not authenticated"}, status=400)
