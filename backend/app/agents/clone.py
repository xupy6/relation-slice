from __future__ import annotations

import json
import re
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
  "role_card": {
    "identity": "...",
    "relationship_boundary": "...",
    "tone_contract": "...",
    "do": ["...", "..."],
    "dont": ["...", "..."]
  },
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

Use the role_card as the strongest behavior contract. If retrieved_memories are
provided, treat them as grounded style and context references, but do not quote
or expose them mechanically. If memories are absent, rely on role_card,
speaking_style, signature_phrases, emotional_tone, reply_rules, and the recent
conversation.
""".strip()


def distill_clone(chat_messages: list[ChatMessage]) -> dict[str, Any]:
    person_a, person_b = participant_names(chat_messages)
    fallback = {
        "clone_name": person_b,
        "target_sender": person_b,
        "persona_summary": "一个语气自然、回应稳定、带一点熟人感的聊天模拟人格。",
        "role_card": {
            "identity": "我是根据聊天记录蒸馏出的 AI 模拟人格，不是真人本人。",
            "relationship_boundary": "保持像熟人聊天一样的亲近感，但不假装拥有真人身份或真实承诺。",
            "tone_contract": "短句、自然、先接住对方情绪，再给出日常化回应。",
            "do": ["延续对方的话题", "保留原有语气特点", "必要时承认自己只是模拟"],
            "dont": ["不要编造隐私事实", "不要冒充真人", "不要协助违法违规行为"],
        },
        "speaking_style": ["短句为主", "语气柔和", "会接住对方情绪"],
        "signature_phrases": ["嗯嗯", "我懂", "慢慢说"],
        "emotional_tone": "温和、松弛、带陪伴感",
        "reply_rules": ["先回应情绪，再回应事情", "少说大道理，多像日常聊天"],
    }

    profile = invoke_json_agent(
        DISTILL_PROMPT,
        {"chat_messages": serialize_messages(chat_messages), "participants": [person_a, person_b]},
        fallback,
    )
    target_sender = str(profile.get("target_sender") or person_b)
    profile.setdefault("role_card", fallback["role_card"])
    profile["memory_snippets"] = _build_memory_snippets(chat_messages, target_sender)
    return profile


def chat_with_clone(profile: dict[str, Any], conversation: list[dict[str, str]], message: str, use_rag: bool = False) -> str:
    llm = get_deepseek_llm()
    payload = {
        "clone_profile": profile,
        "role_card": profile.get("role_card", {}),
        "retrieval_mode": "enabled" if use_rag else "disabled",
        "retrieved_memories": _retrieve_memories(profile, message) if use_rag else [],
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


def _build_memory_snippets(chat_messages: list[ChatMessage], target_sender: str, limit: int = 160) -> list[dict[str, Any]]:
    target_messages = [
        (index, message)
        for index, message in enumerate(chat_messages)
        if not target_sender or message.sender == target_sender
    ]
    source = target_messages or list(enumerate(chat_messages))
    snippets: list[dict[str, Any]] = []

    for index, message in source[-limit:]:
        content = message.content.strip()
        if not content:
            continue

        before = chat_messages[index - 1].content.strip() if index > 0 else ""
        after = chat_messages[index + 1].content.strip() if index + 1 < len(chat_messages) else ""
        snippets.append(
            {
                "id": f"m-{index}",
                "sender": message.sender,
                "content": _clip_text(content, 180),
                "timestamp": message.timestamp.isoformat(),
                "before": _clip_text(before, 120),
                "after": _clip_text(after, 120),
                "keywords": sorted(_tokenize(content))[:12],
            }
        )

    return snippets


def _retrieve_memories(profile: dict[str, Any], query: str, limit: int = 5) -> list[dict[str, Any]]:
    snippets = profile.get("memory_snippets")
    if not isinstance(snippets, list):
        return []

    scored = [
        (_score_memory(query, snippet), snippet)
        for snippet in snippets
        if isinstance(snippet, dict)
    ]
    candidates = [(score, snippet) for score, snippet in scored if score > 0]
    candidates.sort(key=lambda item: item[0], reverse=True)

    reranked = [(_rerank_memory(query, snippet, score), snippet) for score, snippet in candidates[:16]]
    reranked.sort(key=lambda item: item[0], reverse=True)
    return [
        {
            "sender": snippet.get("sender"),
            "content": snippet.get("content"),
            "timestamp": snippet.get("timestamp"),
            "before": snippet.get("before"),
            "after": snippet.get("after"),
        }
        for _score, snippet in reranked[:limit]
    ]


def _score_memory(query: str, snippet: dict[str, Any]) -> float:
    query_tokens = _tokenize(query)
    content = " ".join(str(snippet.get(field, "")) for field in ("content", "before", "after"))
    content_tokens = _tokenize(content)
    if not query_tokens or not content_tokens:
        return 0.0

    overlap = query_tokens & content_tokens
    score = len(overlap) * 2.0
    if query.strip() and query.strip() in content:
        score += 3.0
    score += min(len(content_tokens), 40) / 80
    return score


def _rerank_memory(query: str, snippet: dict[str, Any], base_score: float) -> float:
    content = str(snippet.get("content", ""))
    query_tokens = _tokenize(query)
    content_tokens = _tokenize(content)
    phrase_bonus = 0.0
    for token in query_tokens:
        if len(token) >= 2 and token in content:
            phrase_bonus += 0.35

    style_bonus = 0.4 if any(mark in content for mark in ("哈", "？", "?", "!", "！", "~", "草", "靠")) else 0.0
    density_bonus = min(len(query_tokens & content_tokens), 6) * 0.45
    return base_score + phrase_bonus + style_bonus + density_bonus


def _tokenize(text: str) -> set[str]:
    lower = text.lower()
    tokens = set(re.findall(r"[a-z0-9_]{2,}", lower))
    cjk_chars = re.findall(r"[\u4e00-\u9fff]", text)
    tokens.update(cjk_chars)
    tokens.update("".join(cjk_chars[index : index + 2]) for index in range(max(0, len(cjk_chars) - 1)))
    return {token for token in tokens if token.strip()}


def _clip_text(text: str, max_length: int) -> str:
    return text if len(text) <= max_length else f"{text[:max_length - 1]}..."
