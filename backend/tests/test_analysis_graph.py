import json
import unittest
from datetime import datetime

from app.agents.common import set_llm_factory
from app.graph import run_analysis
from app.main import app
from app.parser import ChatMessage
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
                        "keywords_style": ["轻松", "直接"],
                    },
                    ensure_ascii=False,
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
                        "relationship_type": "安全型",
                        "suggestions": ["增加共同活动", "保持稳定回应"],
                        "confidence": 0.8,
                    },
                    ensure_ascii=False,
                )
            )
        return FakeResponse(
            json.dumps(
                {
                    "intimacy_score": 85,
                    "summary_text": "互动稳定，表达自然。",
                    "fun_tags": ["灵魂共鸣型", "斗嘴冤家型"],
                    "all_reports": {},
                },
                ensure_ascii=False,
            )
        )


def sample_messages():
    return [
        ChatMessage(sender="Alice", content="今天一起吃饭吗？", timestamp=datetime(2026, 8, 25, 12, 0, 0)),
        ChatMessage(sender="Bob", content="好呀，我想吃火锅", timestamp=datetime(2026, 8, 25, 12, 1, 0)),
        ChatMessage(sender="Alice", content="那我订位", timestamp=datetime(2026, 8, 25, 12, 2, 0)),
    ]


class AnalysisGraphTest(unittest.TestCase):
    def setUp(self):
        set_llm_factory(FakeDeepSeek)

    def tearDown(self):
        set_llm_factory(None)

    def test_run_analysis_returns_final_report(self):
        report = run_analysis(sample_messages())

        self.assertEqual(report["intimacy_score"], 85)
        self.assertEqual(report["all_reports"]["relation_report"]["relationship_type"], "安全型")

    def test_analyze_endpoint_returns_report(self):
        client = TestClient(app)
        response = client.post(
            "/api/analyze",
            json={"chat_messages": [message.model_dump(mode="json") for message in sample_messages()]},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["intimacy_score"], 85)


if __name__ == "__main__":
    unittest.main()
