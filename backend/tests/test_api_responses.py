import json
import unittest

from app.main import app
from app.rate_limit import limiter
from fastapi.testclient import TestClient


class ApiResponseTest(unittest.TestCase):
    def setUp(self):
        limiter.reset()
        self.client = TestClient(app)

    def test_health_returns_standard_success(self):
        response = self.client.get("/health")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"code": 0, "data": {"status": "ok"}})

    def test_upload_returns_standard_success(self):
        sample = {
            "chat_messages": [
                {
                    "sender": "Alice",
                    "content": "Lunch?",
                    "timestamp": "2026-08-25 12:00:00",
                }
            ]
        }

        response = self.client.post(
            "/api/upload",
            files={"file": ("chat.json", json.dumps(sample).encode("utf-8"), "application/json")},
        )

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["code"], 0)
        self.assertEqual(payload["data"]["chat_messages"][0]["sender"], "Alice")

    def test_upload_returns_standard_error(self):
        response = self.client.post(
            "/api/upload",
            files={"file": ("chat.unsupported", b"not a chat file", "application/octet-stream")},
        )

        self.assertEqual(response.status_code, 400)
        payload = response.json()
        self.assertEqual(payload["code"], 400)
        self.assertIn("Unsupported file type", payload["message"])


if __name__ == "__main__":
    unittest.main()
