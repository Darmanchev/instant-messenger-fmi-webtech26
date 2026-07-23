import asyncio
from collections import Counter, OrderedDict, defaultdict, deque
from dataclasses import dataclass
from time import monotonic

from fastapi import WebSocket

MAX_TRACKED_RATE_LIMIT_USERS = 10_000


class ConnectionLimitExceeded(Exception):
    pass


@dataclass(frozen=True)
class Connection:
    websocket: WebSocket
    channel_id: int
    user_id: int
    client_ip: str


class ConnectionManager:
    def __init__(self):
        self._connections: dict[int, dict[int, Connection]] = defaultdict(dict)
        self._user_connections: Counter[int] = Counter()
        self._ip_connections: Counter[str] = Counter()
        self._message_timestamps: OrderedDict[int, deque[float]] = OrderedDict()
        self._lock = asyncio.Lock()

    async def connect(
        self,
        websocket: WebSocket,
        channel_id: int,
        user_id: int,
        client_ip: str,
        *,
        max_connections_per_user: int,
        max_connections_per_ip: int,
    ) -> None:
        connection = Connection(websocket, channel_id, user_id, client_ip)
        connection_id = id(websocket)

        async with self._lock:
            if self._user_connections[user_id] >= max_connections_per_user:
                raise ConnectionLimitExceeded("Too many connections for this user")
            if self._ip_connections[client_ip] >= max_connections_per_ip:
                raise ConnectionLimitExceeded("Too many connections from this IP")

            self._connections[channel_id][connection_id] = connection
            self._user_connections[user_id] += 1
            self._ip_connections[client_ip] += 1

        try:
            await websocket.accept()
        except Exception:
            await self.disconnect(websocket, channel_id)
            raise

    async def disconnect(self, websocket: WebSocket, channel_id: int) -> None:
        async with self._lock:
            channel_connections = self._connections.get(channel_id)
            if not channel_connections:
                return

            connection = channel_connections.pop(id(websocket), None)
            if connection is None:
                return

            self._decrement_counter(self._user_connections, connection.user_id)
            self._decrement_counter(self._ip_connections, connection.client_ip)

            if not channel_connections:
                self._connections.pop(channel_id, None)

    async def allow_message(
        self,
        user_id: int,
        *,
        limit: int,
        window_seconds: float = 60.0,
    ) -> bool:
        now = monotonic()
        cutoff = now - window_seconds

        async with self._lock:
            timestamps = self._message_timestamps.get(user_id)
            if timestamps is None:
                if len(self._message_timestamps) >= MAX_TRACKED_RATE_LIMIT_USERS:
                    self._message_timestamps.popitem(last=False)
                timestamps = deque()
                self._message_timestamps[user_id] = timestamps
            else:
                self._message_timestamps.move_to_end(user_id)

            while timestamps and timestamps[0] <= cutoff:
                timestamps.popleft()

            if len(timestamps) >= limit:
                return False

            timestamps.append(now)
            return True

    async def broadcast(
        self,
        message: dict,
        channel_id: int,
        *,
        send_timeout_seconds: float,
    ) -> None:
        async with self._lock:
            connections = list(self._connections.get(channel_id, {}).values())

        async def send(connection: Connection) -> None:
            try:
                await asyncio.wait_for(
                    connection.websocket.send_json(message),
                    timeout=send_timeout_seconds,
                )
            except Exception:
                await self.disconnect(connection.websocket, channel_id)
                try:
                    await connection.websocket.close(
                        code=1011,
                        reason="Failed to deliver message",
                    )
                except RuntimeError:
                    pass

        await asyncio.gather(*(send(connection) for connection in connections))

    @staticmethod
    def _decrement_counter(counter: Counter, key: int | str) -> None:
        counter[key] -= 1
        if counter[key] <= 0:
            del counter[key]


manager = ConnectionManager()
