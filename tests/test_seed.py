import os
import unittest
from unittest.mock import patch

os.environ.setdefault(
    "DATABASE_URL",
    "postgresql+asyncpg://user:password@localhost/instantmessenger",
)
os.environ.setdefault("SECRET_KEY", "a-secure-test-key-with-at-least-32-bytes")

from backend import seed


class SeedSecurityTests(unittest.IsolatedAsyncioTestCase):
    async def test_refuses_to_seed_production(self):
        with patch.object(seed.settings, "ENVIRONMENT", "production"):
            with self.assertRaisesRegex(RuntimeError, "development or test"):
                await seed.seed()


if __name__ == "__main__":
    unittest.main()
