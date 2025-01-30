from channels.generic.websocket import WebsocketConsumer
import json

class FriendsConsumer(WebsocketConsumer):
    def connect(self):
        self.accept()

    def disconnect(self):
        pass

    def receive(self):
        
