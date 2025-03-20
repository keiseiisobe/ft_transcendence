from django.contrib import admin

from pong.models import MatchHistory

# Register your models here.

class MatchHistoryInline(admin.TabularInline):
    model = MatchHistory

