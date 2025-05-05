from channels.generic.websocket import AsyncWebsocketConsumer
import json
import logging
from django.contrib.auth.models import AnonymousUser
from .models import ChatMessage
from channels.db import database_sync_to_async

logger = logging.getLogger("django")

def room_name_for(user_id, other_id):
    a, b = sorted([str(user_id), str(other_id)])
    return f"chat_{a}_{b}"

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope["user"]
        if user.is_anonymous:
            # nếu chưa auth, reject
            return await self.close()

        other_id = int(self.scope["url_route"]["kwargs"]["other_id"])
        room = room_name_for(user.id, other_id)
        self.room_group_name = room

        await self.channel_layer.group_add(room, self.channel_name)
        await self.accept()

    async def disconnect(self, code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        content = data.get("message", "").strip()
        if not content:
            return

        me = self.scope["user"]
        other_id = int(self.scope["url_route"]["kwargs"]["other_id"])

        # Lưu vào DB
        await database_sync_to_async(ChatMessage.objects.create)(
            sender=me,
            recipient_id=other_id,
            content=content
        )

        # Broadcast tới cả hai bên
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat.message",
                "message": content,
                "sender_id": me.id,
            }
        )

    async def chat_message(self, event):
        # gửi lại dạng JSON
        await self.send(text_data=json.dumps({
            "message": event["message"],
            "sender_id": event["sender_id"],
        }))
