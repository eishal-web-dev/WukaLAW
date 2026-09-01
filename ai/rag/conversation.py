"""Conversation-aware query contextualization for the RAG assistant.

A follow-up like "it was an accident" is meaningless to a retriever on its own.
When prior turns exist and the new message looks like a follow-up (short, or
opening with a referential cue), the most recent user turns are prepended so
retrieval searches the *resolved* question. Standalone questions are left
untouched. Deterministic — no LLM call — so it is cheap and unit-testable.
"""
from __future__ import annotations

import re
from dataclasses import dataclass

_WORD = re.compile(r"[a-z0-9]+")
_REFERENTIAL = re.compile(
    r"^\s*(it|its|it's|that|this|these|those|they|them|their|he|she|his|her|"
    r"and|also|what about|how about|why|so|then|but)\b",
    re.IGNORECASE,
)
_SHORT_ENOUGH = 5  # a message this short almost always leans on prior context
_MAX_HISTORY_TURNS = 2  # how many recent user turns to fold in


@dataclass(frozen=True)
class ChatTurn:
    role: str  # "user" | "ai"
    content: str


def _user_turns(history: list[ChatTurn]) -> list[str]:
    return [t.content.strip() for t in history if t.role == "user" and t.content.strip()]


def _looks_like_followup(question: str) -> bool:
    if _REFERENTIAL.match(question):
        return True
    return len(_WORD.findall(question.casefold())) <= _SHORT_ENOUGH


def contextualize_query(history: list[ChatTurn] | None, question: str) -> str:
    """Resolve a possibly-referential follow-up against recent user turns."""
    q = question.strip()
    users = _user_turns(history or [])
    if not users or not _looks_like_followup(q):
        return q
    recent = users[-_MAX_HISTORY_TURNS:]
    return " ".join([*recent, q])


def to_turns(raw: list | None) -> list[ChatTurn]:
    """Coerce loosely-typed history (list of dicts or ChatTurn) into ChatTurns."""
    turns: list[ChatTurn] = []
    for item in raw or []:
        if isinstance(item, ChatTurn):
            turns.append(item)
        elif isinstance(item, dict):
            role = str(item.get("role", "")).strip().lower()
            content = str(item.get("content", "")).strip()
            if role in {"user", "ai", "assistant"} and content:
                turns.append(ChatTurn("user" if role == "user" else "ai", content))
    return turns
