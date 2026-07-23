import unittest

from backend.core.websocket import ConnectionLimitExceeded, ConnectionManager


class FakeWebSocket:
    def __init__(self):
        self.accepted = False
        self.messages = []

    async def accept(self):
        self.accepted = True

    async def send_json(self, message):
        self.messages.append(message)


class ConnectionManagerTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.manager = ConnectionManager()

    async def test_enforces_user_connection_limit(self):
        first = FakeWebSocket()
        second = FakeWebSocket()

        await self.manager.connect(
            first,
            channel_id=1,
            user_id=7,
            client_ip="127.0.0.1",
            max_connections_per_user=1,
            max_connections_per_ip=10,
        )

        with self.assertRaises(ConnectionLimitExceeded):
            await self.manager.connect(
                second,
                channel_id=1,
                user_id=7,
                client_ip="127.0.0.1",
                max_connections_per_user=1,
                max_connections_per_ip=10,
            )

        await self.manager.disconnect(first, channel_id=1)
        await self.manager.connect(
            second,
            channel_id=1,
            user_id=7,
            client_ip="127.0.0.1",
            max_connections_per_user=1,
            max_connections_per_ip=10,
        )
        self.assertTrue(second.accepted)

    async def test_enforces_ip_connection_limit(self):
        first = FakeWebSocket()
        second = FakeWebSocket()

        await self.manager.connect(
            first,
            channel_id=1,
            user_id=7,
            client_ip="127.0.0.1",
            max_connections_per_user=10,
            max_connections_per_ip=1,
        )

        with self.assertRaises(ConnectionLimitExceeded):
            await self.manager.connect(
                second,
                channel_id=1,
                user_id=8,
                client_ip="127.0.0.1",
                max_connections_per_user=10,
                max_connections_per_ip=1,
            )

    async def test_rate_limits_messages_per_user(self):
        self.assertTrue(await self.manager.allow_message(7, limit=2))
        self.assertTrue(await self.manager.allow_message(7, limit=2))
        self.assertFalse(await self.manager.allow_message(7, limit=2))
        self.assertTrue(await self.manager.allow_message(8, limit=2))

    async def test_broadcasts_to_channel_connections(self):
        first = FakeWebSocket()
        second = FakeWebSocket()
        for websocket, user_id in ((first, 7), (second, 8)):
            await self.manager.connect(
                websocket,
                channel_id=1,
                user_id=user_id,
                client_ip=f"127.0.0.{user_id}",
                max_connections_per_user=3,
                max_connections_per_ip=10,
            )

        message = {"content": "hello"}
        await self.manager.broadcast(
            message,
            channel_id=1,
            send_timeout_seconds=1,
        )

        self.assertEqual(first.messages, [message])
        self.assertEqual(second.messages, [message])


if __name__ == "__main__":
    unittest.main()
