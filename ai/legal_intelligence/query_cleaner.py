"""Conservative query cleanup that preserves legal identifiers."""
from __future__ import annotations
import html
import re
import unicodedata


def clean_query(question: str) -> str:
    if not isinstance(question, str):
        raise ValueError("question must be a string")
    text = unicodedata.normalize("NFKC", html.unescape(question))
    text = text.replace("\u200b", "").replace("\ufeff", "")
    text = "".join(ch for ch in text if ch in "\n\t" or unicodedata.category(ch) != "Cc")
    text = re.sub(r"\s+", " ", text).strip()
    if not text:
        raise ValueError("question must not be empty")
    return text
