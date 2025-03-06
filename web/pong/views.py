from django.shortcuts import render
from django.views.decorators.http import require_http_methods

# Create your views here.

@require_http_methods(["GET"])
def index(request):
    return render(request, "pong/index.html")

@require_http_methods(["GET"])
def login(request):
    return render(request, "pong/index.html", { "login_modal": True })

@require_http_methods(["GET"])
def signup(request):
    return render(request, "pong/index.html", { "signup_modal": True })

@require_http_methods(["GET"])
def login_modal(request): # TODO : remove
    return render(request, "pong/login_modal.html")

@require_http_methods(["GET"])
def signup_modal(request): # TODO : remove
    return render(request, "pong/signup_modal.html")
