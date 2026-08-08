"""Lightweight date/event extraction from legal document text.

This module intentionally avoids guessing dates. It extracts only explicit date
strings and returns the surrounding sentence/line as evidence for a case timeline.
"""
from __future__ import annotations

import re
from dataclasses import dataclass
from datetime import datetime


@dataclass(frozen=True)
class TimelineEvent:
    date: str
    date_text: str
    text: str


_PATTERNS = [
    re.compile(r"\b(?P<d>\d{1,2})[./-](?P<m>\d{1,2})[./-](?P<y>\d{4})\b"),
    re.compile(
        r"\b(?P<d>\d{1,2})\s+(?P<mon>Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(?P<y>\d{4})\b",
        re.I,
    ),
    re.compile(
        r"\b(?P<mon>Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(?P<d>\d{1,2}),?\s+(?P<y>\d{4})\b",
        re.I,
    ),
]

_MONTHS = {name[:3].lower(): index for index, name in enumerate(
    ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    1,
)}


def _normalize(match: re.Match[str]) -> str | None:
    try:
        day = int(match.group("d"))
        year = int(match.group("y"))
        if "m" in match.groupdict() and match.groupdict().get("m"):
            month = int(match.group("m"))
        else:
            month = _MONTHS[match.group("mon")[:3].lower()]
        return datetime(year, month, day).date().isoformat()
    except (ValueError, KeyError, TypeError):
        return None


def _context(text: str, start: int, end: int) -> str:
    left = max(text.rfind("\n", 0, start), text.rfind(".", 0, start), text.rfind(";", 0, start))
    right_candidates = [pos for pos in (text.find("\n", end), text.find(".", end), text.find(";", end)) if pos >= 0]
    right = min(right_candidates) if right_candidates else min(len(text), end + 260)
    snippet = " ".join(text[left + 1:right + 1].split())
    return snippet[:500]


def extract_events(text: str | None) -> list[TimelineEvent]:
    value = text or ""
    events: list[TimelineEvent] = []
    seen: set[tuple[str, str]] = set()
    for pattern in _PATTERNS:
        for match in pattern.finditer(value):
            normalized = _normalize(match)
            if not normalized:
                continue
            event_text = _context(value, match.start(), match.end())
            key = (normalized, event_text)
            if key in seen:
                continue
            seen.add(key)
            events.append(TimelineEvent(normalized, match.group(0), event_text))
    events.sort(key=lambda item: item.date)
    return events
