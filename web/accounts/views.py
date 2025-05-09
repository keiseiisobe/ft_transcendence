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

# jwt
from .jwt_utils import create_token_response, delete_token_response

# totp
import pyotp
import qrcode
from io import BytesIO

User = get_user_model()

# Create your views here.

@login_required
def generate_qr(request):
    user = request.user
    if not user.totp_secret:
        user.generate_totp_secret()
    totp = pyotp.TOTP(user.totp_secret)
    otp_uri = totp.provisioning_uri(name=user.username, issuer_name="MyDjangoApp")
    qr = qrcode.make(otp_uri)
    buffer = BytesIO()
    qr.save(buffer, format="PNG")
    buffer.seek(0)
    return HttpResponse(buffer.getvalue(), content_type="image/png")

@require_http_methods(["POST"])
@login_required
def verifyTOTP(request):
    totp_code_raw = request.POST.get("totp_code")
    try:
        totp_code = int(totp_code_raw)
    except (TypeError, ValueError):
        return HttpResponseBadRequest("Invalid TOTP code format")
    user = request.user
    if not user.verify_totp(totp_code):
        return HttpResponseForbidden("Invalid TOTP code")
    user.use_totp = True
    user.save()
    response = HttpResponse("TOTP login success")
    return response

@require_http_methods(["POST"])
def verifyTOTPcode(request):
    username = request.POST.get("username")
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return HttpResponse("Invalid user", status=400)
    totp_code_raw = request.POST.get("totp_code")
    try:
        totp_code = int(totp_code_raw)
    except (TypeError, ValueError):
        return HttpResponseBadRequest("Invalid TOTP code format")
    if not user.verify_totp(totp_code):
        return HttpResponse("Invalid TOTP code", status=401)
    login(request, user)
    request.user.is_login = True
    request.user.save()
    for user in Follow.objects.followers(request.user):
        bust_cache("following", user.pk)
    return create_token_response(request.user.id, "OK")

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
    for user in Follow.objects.followers(request.user):
        bust_cache("following", user.pk)
    return create_token_response(request.user.id, "OK")

@login_required
@require_http_methods(["POST"])
def mylogout(request):
    request.user.is_login = False
    request.user.save()
    for user in Follow.objects.followers(request.user):
        bust_cache("following", user.pk)
    logout(request)
    return delete_token_response("OK")

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
def editTotpOff(request):
    user = request.user
    user.use_totp = False
    user.totp_secret = None
    user.save()
    return JsonResponse({ "message": "OK" })

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
