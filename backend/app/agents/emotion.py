from __future__ import annotations

from typing import TYPE_CHECKING, Any

from app.agents.common import invoke_json_agent, serialize_messages

if TYPE_CHECKING:
    from app.graph import AnalysisState


SYSTEM_PROMPT = """
You are the emotion recognition agent for Relation Slice.
Score message sentiment from -1 to 1, summarize positive/negative/neutral ratios,
and produce a concise time series curve.
Return exactly:
{
  "positive_ratio": 0.0,
  "negative_ratio": 0.0,
  "neutral_ratio": 0.0,
  "emotion_curve": [{"timestamp": "ISO datetime", "score": 0.0}]
}
Ratios should sum to about 1.
""".strip()


def emotion_agent(state: "AnalysisState") -> dict[str, Any]:
    messages = state["chat_messages"]
    fallback = {
        "positive_ratio": 0.5,
        "negative_ratio": 0.1,
        "neutral_ratio": 0.4,
        "emotion_curve": [
            {"timestamp": message.timestamp.isoformat(), "score": 0.0}
            for message in messages[:30]
        ],
    }

    report = invoke_json_agent(
        SYSTEM_PROMPT,
        {"chat_messages": serialize_messages(messages)},
        fallback,
    )
    return {"emotion_report": report}
