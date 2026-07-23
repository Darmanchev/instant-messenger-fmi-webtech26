import os
import unittest

from pydantic import ValidationError

os.environ.setdefault(
    "DATABASE_URL",
    "postgresql+asyncpg://user:password@localhost/instantmessenger",
)
os.environ.setdefault("SECRET_KEY", "a-secure-test-key-with-at-least-32-bytes")

from backend.core.config import Settings


class SettingsTests(unittest.TestCase):
    def test_accepts_secret_generated_from_at_least_32_bytes(self):
        settings = Settings(
            DATABASE_URL="postgresql+asyncpg://user:password@localhost/db",
            SECRET_KEY="0123456789abcdef0123456789abcdef",
            _env_file=None,
        )

        self.assertEqual(
            settings.SECRET_KEY.get_secret_value(),
            "0123456789abcdef0123456789abcdef",
        )

    def test_rejects_short_secret(self):
        with self.assertRaisesRegex(ValidationError, "at least 32 bytes"):
            Settings(
                DATABASE_URL="postgresql+asyncpg://user:password@localhost/db",
                SECRET_KEY="too-short",
                _env_file=None,
            )

    def test_rejects_placeholder_secret(self):
        with self.assertRaisesRegex(ValidationError, "placeholder"):
            Settings(
                DATABASE_URL="postgresql+asyncpg://user:password@localhost/db",
                SECRET_KEY="change-me-this-is-long-but-still-insecure",
                _env_file=None,
            )


if __name__ == "__main__":
    unittest.main()
