import os
import unittest

os.environ.setdefault(
    "DATABASE_URL",
    "postgresql+asyncpg://user:password@localhost/instantmessenger",
)
os.environ.setdefault("SECRET_KEY", "a-secure-test-key-with-at-least-32-bytes")

from backend.api.v1.endpoints import channels, messages
from backend.core.auth import get_current_user


class EndpointSecurityTests(unittest.TestCase):
    def test_channel_routes_require_current_user(self):
        dependencies = {dependency.dependency for dependency in channels.router.dependencies}

        self.assertIn(get_current_user, dependencies)

    def test_message_routes_require_current_user(self):
        dependencies = {dependency.dependency for dependency in messages.router.dependencies}

        self.assertIn(get_current_user, dependencies)


if __name__ == "__main__":
    unittest.main()
