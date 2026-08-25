import json
import unittest
from datetime import datetime

from app.agents.common import set_llm_factory
from app.graph import run_analysis
from app.main import app
from app.parser import ChatMessage
from app.rate_limit import limiter
from fastapi.testclient import TestClient


class FakeResponse:
    def __init__(self, content: str):
        self.content = content


class FakeDeepSeek:
    def invoke(self, messages):
        system_text = messages[0].content
        if "language style analysis agent" in system_text:
            return FakeResponse(
                json.dumps(
                    {
                        "person_a": {
                            "name": "Alice",
                            "extroversion": 0.7,
                            "rationality": 0.5,
                            "emotionality": 0.6,
                            "playfulness": 0.8,
                        },
                        "person_b": {
                            "name": "Bob",
                            "extroversion": 0.6,
                            "rationality": 0.7,
                            "emotionality": 0.5,
                            "playfulness": 0.7,
                        },
                        "keywords_style": ["relaxed", "direct"],
                    }
                )
            )
        if "emotion recognition agent" in system_text:
            return FakeResponse(
                json.dumps(
                    {
                        "positive_ratio": 0.6,
                        "negative_ratio": 0.1,
                        "neutral_ratio": 0.3,
                        "emotion_curve": [{"timestamp": "2026-08-25T12:00:00", "score": 0.5}],
                    }
                )
            )
        if "interaction pattern analysis agent" in system_text:
            return FakeResponse(
                json.dumps(
                    {
                        "dependence_score": {"person_a": 0.8, "person_b": 0.6},
                        "tacit_score": 0.75,
                        "initiation_ratio": {"person_a": 0.55, "person_b": 0.45},
                        "avg_reply_delay": {"person_a": 60, "person_b": 90},
                    }
                )
            )
        if "relationship prediction agent" in system_text:
            return FakeResponse(
                json.dumps(
                    {
                        "relationship_type": "\u5b89\u5168\u578b",
                        "suggestions": ["shared activities", "steady replies"],
                        "confidence": 0.8,
                    }
                )
            )
        return FakeResponse(
            json.dumps(
                {
                    "intimacy_score": 85,
                    "summary_text": "The interaction is steady and natural.",
                    "fun_tags": ["soul sync", "playful banter"],
                    "all_reports": {},
                }
            )
        )


def sample_messages():
    return [
        ChatMessage(sender="Alice", content="Lunch today?", timestamp=datetime(2026, 8, 25, 12, 0, 0)),
        ChatMessage(sender="Bob", content="Sure, hotpot sounds good.", timestamp=datetime(2026, 8, 25, 12, 1, 0)),
        ChatMessage(sender="Alice", content="I'll book a table.", timestamp=datetime(2026, 8, 25, 12, 2, 0)),
    ]


class AnalysisGraphTest(unittest.TestCase):
    def setUp(self):
        set_llm_factory(FakeDeepSeek)
        limiter.reset()

    def tearDown(self):
        set_llm_factory(None)

    def test_run_analysis_returns_final_report(self):
        report = run_analysis(sample_messages())

        self.assertEqual(report["intimacy_score"], 85)
        self.assertEqual(report["all_reports"]["relation_report"]["relationship_type"], "\u5b89\u5168\u578b")

    def test_analyze_endpoint_returns_report(self):
        client = TestClient(app)
        response = client.post(
            "/api/analyze",
            json={"chat_messages": [message.model_dump(mode="json") for message in sample_messages()]},
        )

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["code"], 0)
        self.assertEqual(payload["data"]["intimacy_score"], 85)

    def test_analyze_endpoint_returns_standardized_error(self):
        client = TestClient(app)
        response = client.post("/api/analyze", json={"chat_messages": []})

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()["code"], 400)
        self.assertIn("chat_messages cannot be empty", response.json()["message"])

    def test_analyze_endpoint_rate_limit(self):
        client = TestClient(app)
        body = {"chat_messages": [message.model_dump(mode="json") for message in sample_messages()]}

        for _ in range(10):
            response = client.post("/api/analyze", json=body)
            self.assertEqual(response.status_code, 200)

        response = client.post("/api/analyze", json=body)
        self.assertEqual(response.status_code, 429)
        self.assertEqual(response.json()["code"], 429)


if __name__ == "__main__":
    unittest.main()
