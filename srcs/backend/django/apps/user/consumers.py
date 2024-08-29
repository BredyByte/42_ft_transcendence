from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from user.models import AppUser

class OnlineStatusConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.user = self.scope.get("user")
        self.group_name = "online-status"

        await self.accept()

        if self.user is None or not self.user.is_authenticated:
            await self.send_error(401, "User is not authenticated.")
            await self.close()
            return

        try:
            await self.channel_layer.group_add(self.group_name, self.channel_name)
            await self.add_user_to_online_list(self.user)
            await self.send_online_users_list()
        except Exception as e:
            await self.channel_layer.group_discard(self.group_name, self.channel_name)
            await self.send_error(500, f"Failed to connect: {str(e)}")
            await self.close()

    async def disconnect(self, close_code):
        if self.user is not None and self.user.is_authenticated:
            try:
                await self.remove_user_from_online_list(self.user)
            except Exception as e:
                await self.send_error(500, f"Failed to remove user from online list: {str(e)}")

        try:
            await self.channel_layer.group_discard(self.group_name, self.channel_name)
            await self.send_online_users_list()
        except Exception as e:
            await self.send_error(500, f"Failed to discard user from group: {str(e)}")

    async def send_online_users_list(self):
        try:
            online_users = await self.get_online_users()
            event = {
                "type": "update_online_users_list",
                "online_users": online_users,
            }
            await self.channel_layer.group_send(self.group_name, event)
        except Exception as e:
            await self.send_error(500, f"Failed to send online users list: {str(e)}")

    async def receive(self, text_data):
        print("cont received =>", text_data)
        await self.handle_server_message(text_data)
       
    async def handle_server_message(self, content):
        if content:
            await self.send_message_from_server(content)
        else:
            await self.send_error(400, "No message content provided.")

    async def send_message_from_server(self, message):
        try:
            event = {
                "type": "server_message",
                "message": message,  # Use the message received from the client
            }
            await self.channel_layer.group_send(self.group_name, event)
            print('Message sent to the group:', message)
        except Exception as e:
            await self.send_error(500, f"Failed to send message to the group: {str(e)}")

    async def update_online_users_list(self, event):
        try:
            await self.send_json({"online_users": event["online_users"]})
        except Exception as e:
            await self.send_error(500, f"Failed to update online users list: {str(e)}")

    async def server_message(self, event):
        try:
            await self.send_json({"message": event["message"]})
        except Exception as e:
            await self.send_error(500, f"Failed to update online users list: {str(e)}")

    @database_sync_to_async
    def add_user_to_online_list(self, user):
        if user.is_authenticated:
            user.is_online = True
            user.save()

    @database_sync_to_async
    def remove_user_from_online_list(self, user):
        if user.is_authenticated:
            user.is_online = False
            user.save()

    @database_sync_to_async
    def get_online_users(self):
        return list(
            AppUser.objects.filter(is_online=True).values_list("username", flat=True)
        )

    async def send_error(self, code, message):
        await self.send_json(
            {
                "error": True,
                "errorCode": code,
                "errorMessage": message,
            }
        )
