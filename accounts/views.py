from django.shortcuts import render
from django.views.generic import CreateView, TemplateView
from django.contrib.auth.forms import UserCreationForm
from django.urls import reverse_lazy

# Create your views here.

class SignUpView(CreateView):
    form_class = UserCreationForm
    success_url = reverse_lazy("login")
    template_name = "accounts/signup.html"
    
class MyPageView(TemplateView):
    template_name = "accounts/mypage.html"
