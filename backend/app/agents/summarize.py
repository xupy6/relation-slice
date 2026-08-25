from __future__ import annotations

from typing import TYPE_CHECKING, Any

from app.agents.common import invoke_json_agent

if TYPE_CHECKING:
    from app.graph import AnalysisState


SYSTEM_PROMPT = """
You are the final report agent for Relation Slice.
Generate a fun relationship report with intimacy score, summary text, and tags.
Return exactly:
{
  "intimacy_score": 85,
  "summary_text": "...",
  "fun_tags": ["灵魂共鸣型", "斗嘴冤家型"],
  "all_reports": {
    "language_report": {},
    "emotion_report": {},
    "interaction_report": {},
    "relation_report": {}
  }
}
The intimacy_score must be an integer from 0 to 100.
""".strip()


def summarize_agent(state: "AnalysisState") -> dict[str, Any]:
    all_reports = {
        "language_report": state.get("language_report", {}),
        "emotion_report": state.get("emotion_report", {}),
        "interaction_report": state.get("interaction_report", {}),
        "relation_report": state.get("relation_report", {}),
    }
    fallback = {
        "intimacy_score": _estimate_intimacy(all_reports),
        "summary_text": "你们的互动节奏稳定，既有日常陪伴，也保留了彼此的表达空间。",
        "fun_tags": ["稳定陪伴型", "默契养成中"],
        "all_reports": all_reports,
    }

    report = invoke_json_agent(
        SYSTEM_PROMPT,
        all_reports,
        fallback,
    )
    if not isinstance(report.get("all_reports"), dict):
        report["all_reports"] = {}
    report["all_reports"] = {**all_reports, **report["all_reports"]}
    return {"final_report": report}


def _estimate_intimacy(all_reports: dict[str, Any]) -> int:
    emotion = all_reports.get("emotion_report", {})
    interaction = all_reports.get("interaction_report", {})
    relation = all_reports.get("relation_report", {})
    positive = float(emotion.get("positive_ratio", 0.5) or 0.5)
    tacit = float(interaction.get("tacit_score", 0.5) or 0.5)
    confidence = float(relation.get("confidence", 0.6) or 0.6)
    return round(max(0, min(100, (positive * 40 + tacit * 40 + confidence * 20) * 100 / 100)))
