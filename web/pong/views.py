from django.http import JsonResponse
from django.shortcuts import render
from django.template.loader import render_to_string
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import ensure_csrf_cookie
from django.contrib.auth.decorators import login_required
from friendship.models import Follow
from django.urls import reverse
from matches.models import Match
from django.db import models

# Create your views here.

def indexContext(_):
    return {
    }

@require_http_methods(["GET"])
@ensure_csrf_cookie
def index(request):
    return render(request, "pong/index.html", indexContext(request))

@require_http_methods(["GET"])
@ensure_csrf_cookie
def login(request):
    return render(request, "pong/index.html", indexContext(request))

@require_http_methods(["GET"])
@ensure_csrf_cookie
def signup(request):
    return render(request, "pong/index.html", indexContext(request))

def myPageData(request):
    friendList = Follow.objects.following(request.user)
    
    # Get matches where the user is either player 1 or player 2
    user_matches = Match.objects.filter(
        models.Q(p1_user=request.user) | models.Q(p2_user=request.user),
        is_finished=True
    ).order_by("-date")
    
    # Count wins and losses
    wins = 0
    loses = 0
    
    for match in user_matches:
        if match.p1_user == request.user and match.p1_score > match.p2_score:
            wins += 1
        elif match.p2_user == request.user and match.p2_score > match.p1_score:
            wins += 1
        else:
            loses += 1
    
    return {
        "user": request.user,
        "friend_list": friendList,
        "wins": wins,
        "loses": loses,
        "matches": user_matches
    }

@login_required
@require_http_methods(["GET"])
@ensure_csrf_cookie
def mypage(request):
    return render(request, "pong/mypage.html", myPageData(request))

@login_required
@require_http_methods(["GET"])
@ensure_csrf_cookie
def edit_username(request):
    return render(request, "pong/mypage.html", myPageData(request))

@login_required
@require_http_methods(["GET"])
@ensure_csrf_cookie
def edit_password(request):
    return render(request, "pong/mypage.html", myPageData(request))

@login_required
@require_http_methods(["GET"])
@ensure_csrf_cookie
def add_friend(request):
    return render(request, "pong/mypage.html", myPageData(request))

@login_required
@require_http_methods(["GET"])
@ensure_csrf_cookie
def edit_avatar(request):
    return render(request, "pong/mypage.html", myPageData(request))

@require_http_methods(["GET"])
@ensure_csrf_cookie
def ssr_index(request):
    return JsonResponse({
        "content": render_to_string("pong/index_content.html", request=request),
        "modals": [
            render_to_string("pong/login_modal.html", request=request),
            render_to_string("pong/signup_modal.html", request=request)
        ]
    })

@require_http_methods(["GET"])
@ensure_csrf_cookie
def ssr_mypage(request):
    if request.user.is_authenticated == False:
        return JsonResponse({ "message": "Unauthorized"}, status=401)
    return JsonResponse({
        "content": render_to_string("pong/mypage_content.html", myPageData(request), request),
        "modals": [
            render_to_string("pong/edit_avatar_modal.html", request=request),
            render_to_string("pong/edit_password_modal.html", request=request),
            render_to_string("pong/edit_usename_modal.html", request=request),
            render_to_string("pong/add_friend_modal.html", request=request),
        ]
    })
