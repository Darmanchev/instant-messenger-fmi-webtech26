from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        self.active: dict[int, list[WebSocket]] = {}

    async def connect(self, ws: WebSocket, channel_id: int):
        await ws.accept()
        if channel_id not in self.active:
            self.active[channel_id] = []
        self.active[channel_id].append(ws)

    def disconnect(self, ws: WebSocket, channel_id: int):
        if channel_id in self.active:
            self.active[channel_id].remove(ws)

    async def broadcast(self, message: dict, channel_id: int):
        for ws in self.active.get(channel_id, []):
            await ws.send_json(message)

manager = ConnectionManager()