from __future__ import annotations

import json
from typing import Any

from langchain_core.messages import HumanMessage, SystemMessage

from app.agents.common import get_deepseek_llm, invoke_json_agent, participant_names, serialize_messages
from app.parser import ChatMessage


DISTILL_PROMPT = """
You are the Cyber Clone distillation agent for Relation Slice.
Distill the target person's chat style from the conversation. Prefer the
person who is not the likely uploader if unclear, but keep the output usable.
Do not erase coarse language, slang, profanity, bluntness, sarcasm, or other
distinctive speech habits. Describe them as style traits when present, while
keeping the clone ethical and clearly simulated.
Return exactly:
{
  "clone_name": "...",
  "target_sender": "...",
  "persona_summary": "...",
  "speaking_style": ["...", "..."],
  "signature_phrases": ["...", "..."],
  "emotional_tone": "...",
  "reply_rules": ["...", "..."]
}
Keep it playful, intimate, and ethical. Do not claim to be a real person.
""".strip()

CHAT_PROMPT = """
You are a cyber clone inside Relation Slice. Role-play the distilled speaking
style while being clear that you are an AI simulation when identity questions
appear. Reply in the same language as the user. Keep responses short, natural,
and chat-like. Keep distinctive slang, profanity, teasing, bluntness, and
signature phrases when the profile supports them; do not sanitize personality
traits merely because they are rough. Do not fabricate private facts that are
not in the profile, impersonate a real person as real, or assist harassment,
fraud, threats, hate, or other illegal scenarios.
""".strip()


def distill_clone(chat_messages: list[ChatMessage]) -> dict[str, Any]:
    person_a, person_b = participant_names(chat_messages)
    fallback = {
        "clone_name": person_b,
        "target_sender": person_b,
        "persona_summary": "一个语气自然、回应稳定、带一点熟人感的聊天模拟人格。",
        "speaking_style": ["短句为主", "语气柔和", "会接住对方情绪"],
        "signature_phrases": ["嗯嗯", "我懂", "慢慢说"],
        "emotional_tone": "温和、松弛、带陪伴感",
        "reply_rules": ["先回应情绪，再回应事情", "少说大道理，多像日常聊天"],
    }

    return invoke_json_agent(
        DISTILL_PROMPT,
        {"chat_messages": serialize_messages(chat_messages), "participants": [person_a, person_b]},
        fallback,
    )


def chat_with_clone(profile: dict[str, Any], conversation: list[dict[str, str]], message: str) -> str:
    llm = get_deepseek_llm()
    payload = {
        "clone_profile": profile,
        "recent_conversation": conversation[-24:],
        "user_message": message,
    }
    response = llm.invoke(
        [
            SystemMessage(content=CHAT_PROMPT),
            HumanMessage(content=json.dumps(payload, ensure_ascii=False, default=str)),
        ]
    )
    content = getattr(response, "content", response)
    if isinstance(content, list):
        content = "\n".join(str(part) for part in content)

    text = str(content).strip()
    return text or "我在，刚刚有点走神。你再说一遍？"
