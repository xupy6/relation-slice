from __future__ import annotations

from typing import TYPE_CHECKING, Any

from app.agents.common import invoke_json_agent

if TYPE_CHECKING:
    from app.graph import AnalysisState


SYSTEM_PROMPT = """
You are the relationship prediction agent for Relation Slice.
Use attachment theory carefully and keep the output playful but not clinical.
Return exactly:
{
  "relationship_type": "安全型",
  "suggestions": ["...", "..."],
  "confidence": 0.0
}
Confidence must be between 0 and 1.
""".strip()


def relation_predict_agent(state: "AnalysisState") -> dict[str, Any]:
    fallback = {
        "relationship_type": "安全型",
        "suggestions": ["增加共同活动", "保持稳定回应", "把重要感受说清楚"],
        "confidence": 0.7,
    }

    report = invoke_json_agent(
        SYSTEM_PROMPT,
        {
            "language_report": state.get("language_report", {}),
            "emotion_report": state.get("emotion_report", {}),
            "interaction_report": state.get("interaction_report", {}),
        },
        fallback,
    )
    return {"relation_report": report}
