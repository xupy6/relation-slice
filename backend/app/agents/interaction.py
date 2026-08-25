from __future__ import annotations

from collections import Counter, defaultdict
from datetime import datetime
from typing import TYPE_CHECKING, Any

from app.agents.common import invoke_json_agent, participant_names, serialize_messages
from app.parser import ChatMessage

if TYPE_CHECKING:
    from app.graph import AnalysisState


SYSTEM_PROMPT = """
You are the interaction pattern analysis agent for Relation Slice.
Use the supplied computed statistics and chat snippets to estimate dependence,
tacit understanding, initiation ratio, and average reply delay.
Return exactly:
{
  "dependence_score": {"person_a": 0.0, "person_b": 0.0},
  "tacit_score": 0.0,
  "initiation_ratio": {"person_a": 0.0, "person_b": 0.0},
  "avg_reply_delay": {"person_a": 0.0, "person_b": 0.0}
}
Scores and ratios must be between 0 and 1. Reply delay is in seconds.
""".strip()


def interaction_agent(state: "AnalysisState") -> dict[str, Any]:
    messages = sorted(state["chat_messages"], key=lambda message: message.timestamp)
    stats = _compute_interaction_stats(messages)
    fallback = {
        "dependence_score": stats["dependence_score"],
        "tacit_score": stats["tacit_score"],
        "initiation_ratio": stats["initiation_ratio"],
        "avg_reply_delay": stats["avg_reply_delay"],
    }

    report = invoke_json_agent(
        SYSTEM_PROMPT,
        {"computed_stats": stats, "chat_messages": serialize_messages(messages)},
        fallback,
    )
    return {"interaction_report": report}


def _compute_interaction_stats(messages: list[ChatMessage]) -> dict[str, Any]:
    person_a, person_b = participant_names(messages)
    counts = Counter(message.sender for message in messages)
    total = max(sum(counts.values()), 1)

    initiation_counts = Counter()
    reply_delays: dict[str, list[float]] = defaultdict(list)
    previous: ChatMessage | None = None

    for message in messages:
        if previous is None or _seconds_between(previous.timestamp, message.timestamp) > 1800:
            initiation_counts[message.sender] += 1
        elif previous.sender != message.sender:
            reply_delays[message.sender].append(_seconds_between(previous.timestamp, message.timestamp))
        previous = message

    initiations = max(sum(initiation_counts.values()), 1)
    avg_delay_a = _avg(reply_delays.get(person_a, []))
    avg_delay_b = _avg(reply_delays.get(person_b, []))
    reply_balance = 1 - min(abs(avg_delay_a - avg_delay_b) / max(avg_delay_a, avg_delay_b, 1), 1)
    message_balance = 1 - abs(counts[person_a] - counts[person_b]) / total

    return {
        "message_count": dict(counts),
        "dependence_score": {
            "person_a": round(min(1, counts[person_a] / total * 1.6), 2),
            "person_b": round(min(1, counts[person_b] / total * 1.6), 2),
        },
        "tacit_score": round(max(0, min(1, (reply_balance * 0.55) + (message_balance * 0.45))), 2),
        "initiation_ratio": {
            "person_a": round(initiation_counts[person_a] / initiations, 2),
            "person_b": round(initiation_counts[person_b] / initiations, 2),
        },
        "avg_reply_delay": {
            "person_a": round(avg_delay_a, 2),
            "person_b": round(avg_delay_b, 2),
        },
    }


def _seconds_between(start: datetime, end: datetime) -> float:
    return max(0.0, (end - start).total_seconds())


def _avg(values: list[float]) -> float:
    return sum(values) / len(values) if values else 0.0
