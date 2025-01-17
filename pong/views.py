from django.shortcuts import render
from django.http import HttpResponse
from django.shortcuts import render

# Create your views here.
def index(request):
    return render(request, "pong/index.html")

def login_page(request):
    return render(request, "pong/login.html")

def signup_page(request):
    return render(request, "pong/signup.html")

def mypage(request):
    return HttpResponse("You are at pong mypage.")
