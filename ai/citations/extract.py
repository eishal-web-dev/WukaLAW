"""Citation extraction for Pakistani legal text.

Detects statutes (Section X [of Act]), constitutional articles, and
case-law reporter citations (PLD / SCMR / YLR / MLD / CLC / PCr.LJ ...).
Rule-based and free.
"""

import re
from dataclasses import dataclass

from ai.preprocessing.sentences import split_sentences

_REPORTERS = r"(?:PLD|SCMR|YLR|MLD|CLC|P\s?Cr\.?\s?L\.?\s?J|PLC|GBLR|PTD)"

_PATTERNS: list[tuple[str, re.Pattern]] = [
    # 2009 SCMR 230  |  PLD 2020 SC 1
    ("case_law", re.compile(rf"\b\d{{4}}\s+{_REPORTERS}\s+\d+\b", re.I)),
    ("case_law", re.compile(rf"\b{_REPORTERS}\s+\d{{4}}\s+[A-Za-z.]+\s+\d+\b", re.I)),
    # Article 4 of the Constitution / Article 199
    ("constitution", re.compile(r"\bArticle\s+\d+[A-Za-z()\-]*(?:\s+of\s+the\s+Constitution[\w\s,]*)?", re.I)),
    # Section 302(b) of the Pakistan Penal Code / Section 497
    ("statute", re.compile(
        r"\bSection\s+\d+[A-Za-z()\-]*(?:\s+(?:of|read with)\s+(?:the\s+)?[A-Z][A-Za-z .,]*?(?:Act|Code|Ordinance|Rules)(?:,?\s+\d{4})?)?",
    )),
]


@dataclass
class Citation:
    type: str  # statute | constitution | case_law
    text: str
    context: str  # the sentence it appears in


_CORE = re.compile(r"\b(section|article)\s+\d+[A-Za-z()\-]*", re.I)


def _dedup_key(kind: str, cited: str) -> tuple[str, str]:
    """"Section 302" and "Section 302 of the Penal Code" are the same citation."""
    core = _CORE.search(cited)
    return (kind, core.group(0).lower() if core else cited.lower())


def extract_citations(text: str) -> list[Citation]:
    best: dict[tuple[str, str], Citation] = {}
    for sentence in split_sentences(text):
        for kind, pattern in _PATTERNS:
            for match in pattern.finditer(sentence):
                cited = " ".join(match.group(0).split()).rstrip(" .,")
                key = _dedup_key(kind, cited)
                existing = best.get(key)
                if existing is None or len(cited) > len(existing.text):
                    best[key] = Citation(type=kind, text=cited, context=sentence)
    return list(best.values())
