from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as UserAdminBase

from .forms import UserCreationForm, UserChangeForm
from .models import User

# Register your models here.

class UserAdmin(UserAdminBase):
    add_form = UserCreationForm
    form = UserChangeForm
    model = User
    list_display = ("username", "is_staff", "is_active",)
    list_filter = ("username", "is_staff", "is_active",)
    fieldsets = (
        (None, {"fields": ("username", "password", "avatar")}),
        ("Permissions", {"fields": ("is_staff", "is_active", "groups", "user_permissions")}),
    )
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": (
                "username", "password1", "password2", "avatar", "is_staff",
                "is_active", "groups", "user_permissions"
            )}
        ),
    )
    search_fields = ("username",)
    ordering = ("username",)

admin.site.register(User, UserAdmin)
