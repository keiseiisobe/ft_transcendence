from django.http import JsonResponse
from django.shortcuts import render
from django.template.loader import render_to_string
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import ensure_csrf_cookie
from django.contrib.auth.decorators import login_required

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

@login_required
@require_http_methods(["GET"])
@ensure_csrf_cookie
def mypage(request):
    return render(request, "pong/mypage.html")

@require_http_methods(["GET"])
def ssr_index(request):
    return JsonResponse({
        "content": render_to_string("pong/index_content.html", request=request),
        "modals": [
            render_to_string("pong/login_modal.html", request=request),
            render_to_string("pong/signup_modal.html", request=request)
        ]
    })

@require_http_methods(["GET"])
def ssr_mypage(request):
    if request.user.is_authenticated == False:
        return JsonResponse({ "message": "Unauthorized"}, status=401)
    return JsonResponse({
        "content": render_to_string("pong/mypage_content.html", request=request),
        "modals": [
            render_to_string("pong/edit_avatar_modal.html", request=request),
            render_to_string("pong/edit_password_modal.html", request=request),
            render_to_string("pong/edit_usename_modal.html", request=request),
            render_to_string("pong/add_friend_modal.html", request=request),
        ]
    })
