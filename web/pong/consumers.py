import json

from channels.generic.websocket import WebsocketConsumer

left_paddle_y = 1

class PongAiConsumer(WebsocketConsumer):
    def connect(self):
        self.accept()

    def disconnect(self, close_code):
        pass

    def receive(self, text_data):
        global left_paddle_y
        left_paddle_y *= -1
        self.send(text_data=json.dumps({"action": left_paddle_y}))
