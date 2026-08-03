"""Conservative, deterministic cleaning for legal-document text."""

from __future__ import annotations

import re
from collections import Counter

from apps.api.ai.preprocessing.clean import clean_text as _legacy_clean_text

_PAGE_LINE = re.compile(r"^\s*(?:page\s*)?[-–—]?\s*\d+\s*(?:of\s+\d+)?\s*[-–—]?\s*$", re.I)
_PAGE_PREFIX = re.compile(r"^\s*page\s+\d+\s+of\s+\d+\s*(?P<rest>.*)$", re.I)
_PROTECTED = re.compile(
    r"\b(?:section|article|case|appeal|petition|reference|application|pld|scmr|clc|ylr|mld)\b|"
    r"\b\d{1,2}[./-]\d{1,2}[./-]\d{2,4}\b|\b\d{4}\b",
    re.I,
)
_MOJIBAKE = {
    "â€™": "’", "â€˜": "‘", "â€œ": "“", "â€": "”", "â€“": "–", "â€”": "—",
    "Â ": " ", "Â": "", "ï»¿": "", "â€¦": "…", "Ã—": "×", "â€¢": "•",
}


def repair_mojibake(text: str) -> tuple[str, int]:
    """Replace only well-known UTF-8/Windows-1252 decoding artifacts."""
    repairs = 0
    for broken, fixed in _MOJIBAKE.items():
        count = text.count(broken)
        if count:
            text = text.replace(broken, fixed)
            repairs += count
    text = text.replace("\ufeff", "").replace("\u00a0", " ")
    return text, repairs


def _header_footer_candidates(lines: list[str]) -> set[str]:
    candidates: list[str] = []
    for index, line in enumerate(lines):
        if not _PAGE_LINE.fullmatch(line):
            continue
        for adjacent in (index - 1, index + 1):
            if 0 <= adjacent < len(lines):
                value = re.sub(r"\s+", " ", lines[adjacent]).strip()
                if 4 <= len(value) <= 160 and not _PROTECTED.search(value):
                    candidates.append(value.casefold())
    return {value for value, count in Counter(candidates).items() if count >= 3}


def clean_legal_text(raw: str) -> tuple[str, list[str]]:
    """Clean text without altering legally meaningful tokens or guessing content."""
    if not isinstance(raw, str):
        raise TypeError("raw text must be a string")
    text, repair_count = repair_mojibake(raw)
    lines = text.splitlines()
    repeated = _header_footer_candidates(lines)
    kept: list[str] = []
    page_markers = 0
    repeated_removed = 0
    for line in lines:
        if _PAGE_LINE.fullmatch(line):
            page_markers += 1
            continue
        prefix = _PAGE_PREFIX.match(line)
        if prefix:
            page_markers += 1
            line = prefix.group("rest")
            if not line.strip():
                continue
        normalized = re.sub(r"\s+", " ", line).strip()
        if normalized.casefold() in repeated and not _PROTECTED.search(normalized):
            repeated_removed += 1
            continue
        kept.append(line)

    # Reuse the established whitespace/dehyphenation behavior after safer filtering.
    cleaned = _legacy_clean_text("\n".join(kept))
    warnings: list[str] = []
    if repair_count:
        warnings.append(f"repaired_mojibake:{repair_count}")
    if page_markers:
        warnings.append(f"removed_page_markers:{page_markers}")
    if repeated_removed:
        warnings.append(f"removed_repeated_headers_footers:{repeated_removed}")
    if raw.strip() and len(cleaned) < len(raw.strip()) * 0.55:
        warnings.append("suspicious_size_reduction")
    return cleaned, warnings


def clean_text(raw: str) -> str:
    """Compatibility convenience wrapper returning only cleaned text."""
    return clean_legal_text(raw)[0]
