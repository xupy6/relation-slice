from __future__ import annotations

import json
import os
import re
from collections.abc import Callable
from pathlib import Path
from typing import Any

from langchain_deepseek import ChatDeepSeek
from langchain_core.messages import HumanMessage, SystemMessage
from dotenv import load_dotenv

from app.parser import ChatMessage


load_dotenv(Path(__file__).resolve().parents[2] / ".env")

LlmFactory = Callable[[], Any]
_llm_factory: LlmFactory | None = None


def set_llm_factory(factory: LlmFactory | None) -> None:
    global _llm_factory
    _llm_factory = factory


def get_deepseek_llm() -> Any:
    if _llm_factory is not None:
        return _llm_factory()

    return ChatDeepSeek(
        model="deepseek-chat",
        temperature=0.7,
        api_key=os.getenv("DEEPSEEK_API_KEY") or None,
    )


def invoke_json_agent(system_prompt: str, user_payload: dict[str, Any], fallback: dict[str, Any]) -> dict[str, Any]:
    llm = get_deepseek_llm()
    response = llm.invoke(
        [
            SystemMessage(content=system_prompt),
            HumanMessage(
                content=(
                    "Return JSON only. Do not wrap it in Markdown.\n\n"
                    f"Input:\n{json.dumps(user_payload, ensure_ascii=False, default=str)}"
                )
            ),
        ]
    )

    content = getattr(response, "content", response)
    if isinstance(content, list):
        content = "\n".join(str(part) for part in content)

    try:
        parsed = _loads_json_object(str(content))
    except ValueError:
        return fallback

    return parsed if isinstance(parsed, dict) else fallback


def serialize_messages(messages: list[ChatMessage], limit: int = 240) -> list[dict[str, Any]]:
    trimmed = messages[-limit:]
    return [message.model_dump(mode="json") for message in trimmed]


def participant_names(messages: list[ChatMessage]) -> tuple[str, str]:
    names: list[str] = []
    for message in messages:
        if message.sender not in names:
            names.append(message.sender)
        if len(names) == 2:
            break

    while len(names) < 2:
        names.append(f"person_{chr(ord('a') + len(names))}")

    return names[0], names[1]


def _loads_json_object(text: str) -> Any:
    stripped = text.strip()
    if stripped.startswith("```"):
        stripped = re.sub(r"^```(?:json)?\s*", "", stripped)
        stripped = re.sub(r"\s*```$", "", stripped)

    try:
        return json.loads(stripped)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", stripped, flags=re.DOTALL)
        if not match:
            raise ValueError("No JSON object found.")
        return json.loads(match.group(0))
