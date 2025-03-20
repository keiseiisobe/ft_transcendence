from django.http import JsonResponse
from django.shortcuts import render
from django.template.loader import render_to_string
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import ensure_csrf_cookie
from django.contrib.auth.decorators import login_required
from friendship.models import Follow

# Create your views here.

@require_http_methods(["GET"])
@ensure_csrf_cookie
def index(request):
    return render(request, "pong/index.html")

@require_http_methods(["GET"])
@ensure_csrf_cookie
def login(request):
    return render(request, "pong/index.html")

@require_http_methods(["GET"])
@ensure_csrf_cookie
def signup(request):
    return render(request, "pong/index.html")

def myPageData(request):
    friendList = Follow.objects.following(request.user)
    wins = request.user.matchhistory_set.filter(result=1).count()
    loses = request.user.matchhistory_set.filter(result=0).count()
    matches = request.user.matchhistory_set.all().order_by("-id")
    return {
        "user": request.user,
        "friend_list": friendList,
        "wins": wins,
        "loses": loses,
        "matches": matches
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

@login_required
@require_http_methods(["POST"])
@ensure_csrf_cookie
def gameover(request):
    opponent = request.POST["opponent"]
    score_user = request.POST["score_user"]
    score_opponent = request.POST["score_opponent"]
    result = request.POST["result"]
    request.user.matchhistory_set.create(opponent=opponent, score_user=score_user, score_opponent=score_opponent, result=result)
    return JsonResponse({"message": "OK"})

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
