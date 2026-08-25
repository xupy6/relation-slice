from __future__ import annotations

from typing import TYPE_CHECKING, Any

from app.agents.common import invoke_json_agent, participant_names, serialize_messages

if TYPE_CHECKING:
    from app.graph import AnalysisState


SYSTEM_PROMPT = """
You are the language style analysis agent for Relation Slice.
Analyze two people's wording habits, average sentence length, punctuation,
emoji/sticker tendency, modal particles, and personality tendencies.
Return exactly:
{
  "person_a": {"name": "...", "extroversion": 0.0, "rationality": 0.0, "emotionality": 0.0, "playfulness": 0.0},
  "person_b": {"name": "...", "extroversion": 0.0, "rationality": 0.0, "emotionality": 0.0, "playfulness": 0.0},
  "keywords_style": ["...", "..."]
}
Scores must be between 0 and 1.
""".strip()


def language_style_agent(state: "AnalysisState") -> dict[str, Any]:
    messages = state["chat_messages"]
    person_a, person_b = participant_names(messages)
    fallback = {
        "person_a": {"name": person_a, "extroversion": 0.5, "rationality": 0.5, "emotionality": 0.5, "playfulness": 0.5},
        "person_b": {"name": person_b, "extroversion": 0.5, "rationality": 0.5, "emotionality": 0.5, "playfulness": 0.5},
        "keywords_style": ["温和", "日常", "轻松"],
    }

    report = invoke_json_agent(
        SYSTEM_PROMPT,
        {"chat_messages": serialize_messages(messages), "participants": [person_a, person_b]},
        fallback,
    )
    return {"language_report": report}
