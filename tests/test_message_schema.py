import unittest

from pydantic import ValidationError

from backend.schemas.message import MessageCreate


class MessageCreateTests(unittest.TestCase):
    def test_accepts_message_up_to_255_characters(self):
        message = MessageCreate(content="a" * 255)

        self.assertEqual(len(message.content), 255)

    def test_rejects_message_over_255_characters(self):
        with self.assertRaises(ValidationError):
            MessageCreate(content="a" * 256)

    def test_rejects_malformed_json(self):
        with self.assertRaises(ValidationError):
            MessageCreate.model_validate_json("{not-json}")

    def test_rejects_unknown_fields(self):
        with self.assertRaises(ValidationError):
            MessageCreate(content="hello", unexpected=True)


if __name__ == "__main__":
    unittest.main()
