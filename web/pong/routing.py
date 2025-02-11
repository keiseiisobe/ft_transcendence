from django.urls import re_path

from . import consumers

websocket_urlpatterns = [
    re_path(r"ws/pong/ai_player/", consumers.AIPongConsumer.as_asgi()),
]
