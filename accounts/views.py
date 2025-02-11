from django.db import DataError
from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout, get_user_model
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.password_validation import validate_password
from django.urls import reverse_lazy
from django.http import HttpResponse, JsonResponse, FileResponse, HttpResponseNotFound, HttpResponseForbidden, HttpResponseRedirect
from django.core.exceptions import ValidationError, ObjectDoesNotExist
from friendship.models import Friend, Follow
from friendship.exceptions import AlreadyExistsError
from pong.models import MatchHistory
import json, os

# Create your views here.

# jwtに必要
import jwt
from datetime import datetime, timedelta
from django.conf import settings
from django.contrib.auth.decorators import login_required

# totpに必要
import pyotp
import qrcode
from io import BytesIO

User = get_user_model()

# @login_required
def generate_qr(request, username):
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return HttpResponse("Invalid user", status=400)

    # まだTOTPが設定されていない場合、新しいシークレットを生成
    if not user.totp_secret:
        user.generate_totp_secret()

    totp = pyotp.TOTP(user.totp_secret)
    otp_uri = totp.provisioning_uri(name=user.username, issuer_name="MyDjangoApp")

    # QRコードを生成
    qr = qrcode.make(otp_uri)
    buffer = BytesIO()
    qr.save(buffer, format="PNG")
    buffer.seek(0)

    return HttpResponse(buffer.getvalue(), content_type="image/png")

@login_required
def protected_view(request):
    return JsonResponse({"message": f"Hello {request.user.username}, this is a protected route!"})

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

def totpLogin(request):
    if request.method != "POST":
        return JsonResponse({"success": False, "message": "無効なリクエスト"}, status=400)

    username = request.POST.get("username")
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return HttpResponse("Invalid user", status=400)

    totp_code = request.POST.get("totp_code")
    totp_code = int(totp_code)

    if not user.verify_totp(totp_code):
        return HttpResponseForbidden("Invalid TOTP code")  # 認証失敗

    login(request, user)
    request.user.is_login = True
    request.user.save()
    expiration_time_access = datetime.utcnow() + timedelta(seconds=30)  # 30秒
    expiration_time_refresh = datetime.utcnow() + timedelta(days=365)  # 1年

    payload_access = {
        "id": user.id,
        "username": user.username,
        "exp": expiration_time_access,
        "iat": datetime.utcnow()
    }
    payload_refresh = {
        "id": user.id,
        "username": user.username,
        "exp": expiration_time_refresh,
        "iat": datetime.utcnow()
    }

    SECRET_KEY = settings.SECRET_KEY
    access_token = jwt.encode(payload_access, SECRET_KEY, algorithm="HS256")
    refresh_token = jwt.encode(payload_refresh, SECRET_KEY, algorithm="HS256")

    response = render(request, "pong/header.html", {"user": request.user})
    response.set_cookie(
        key="jwt_access",
        value=access_token,
        httponly=True,
        secure=True,
        samesite="Lax",
        expires=expiration_time_access.strftime("%a, %d-%b-%Y %H:%M:%S GMT")
    )
    response.set_cookie(
        key="jwt_refresh",
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite="Lax",
        expires=expiration_time_refresh.strftime("%a, %d-%b-%Y %H:%M:%S GMT")
    )

    return response

def mylogin(request):
    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")

        user = authenticate(request, username=username, password=password)
        if user is not None:
            if user.use_totp == True:
                additional_data = {
                    user,
                    'use_totp_login'
                }
                additional_data_str = f'{additional_data}'
                response = additional_data_str
                return HttpResponse(response)

            login(request, user)
            request.user.is_login = True
            request.user.save()

            expiration_time_access = datetime.utcnow() + timedelta(seconds=30)  # 30秒
            expiration_time_refresh = datetime.utcnow() + timedelta(days=365)  # 1年

            payload_access = {
                "id": user.id,
                "username": user.username,
                "exp": expiration_time_access,
                "iat": datetime.utcnow()
            }
            payload_refresh = {
                "id": user.id,
                "username": user.username,
                "exp": expiration_time_refresh,
                "iat": datetime.utcnow()
            }

            SECRET_KEY = settings.SECRET_KEY
            access_token = jwt.encode(payload_access, SECRET_KEY, algorithm="HS256")
            refresh_token = jwt.encode(payload_refresh, SECRET_KEY, algorithm="HS256")

            response = render(request, "pong/header.html", {"user": request.user})
            response.set_cookie(
                key="jwt_access",
                value=access_token,
                httponly=True,
                secure=True,
                samesite="Lax",
                expires=expiration_time_access.strftime("%a, %d-%b-%Y %H:%M:%S GMT")
            )
            response.set_cookie(
                key="jwt_refresh",
                value=refresh_token,
                httponly=True,
                secure=True,
                samesite="Lax",
                expires=expiration_time_refresh.strftime("%a, %d-%b-%Y %H:%M:%S GMT")
            )

            return response
        else:
            return HttpResponseNotFound("Username or password is incorrect")

def mylogout(request):
    request.user.is_login = False
    request.user.save()
    logout(request)

    response = render(request, "pong/header.html", {"user": request.user})
    response.delete_cookie("jwt_access")
    response.delete_cookie("jwt_refresh")

    return response

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
        default = "accounts/images/gnu.png"
        previous = request.user.avatar.path
        if previous != default:
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
