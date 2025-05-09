from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as UserAdminBase

from .forms import UserCreationForm, UserChangeForm
from .models import User

# Register your models here.

@admin.register(User)
class UserAdmin(UserAdminBase):
    add_form = UserCreationForm
    form = UserChangeForm
    model = User
    list_display = ("username", "is_staff", "is_active",)
    list_filter = ("username", "is_staff", "is_active",)
    fieldsets = (
        (None, {"fields": ("username", "password", "avatar", "is_staff", "is_active")}),
    )
    add_fieldsets = (
        (None, { "fields": ( "username", "password1", "password2", "avatar", "is_staff", "is_active")}),
    )
    search_fields = ("username",)
    ordering = ("username",)
