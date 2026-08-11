"""Sentence splitting that survives legal text.

Judgments are full of abbreviations ("Mr. Justice", "C.P. No. 12/2002",
initials like "M. Jafar") whose periods are not sentence boundaries. A naive
period split shreds bench compositions into garbage fragments, so known
abbreviation periods are masked before splitting and restored after.
"""

import re

_ABBREVIATIONS = re.compile(
    r"\b(Mr|Mrs|Ms|Dr|Prof|Hon|Sr|Jr|St|No|Nos|Vs|Vol|Art|Sec|Ss|Pp|Ch|Mst|Adv|"
    r"Etc|Ord|Const|Crl|Cr|Civ|Misc|Rev|Retd|Ret|Co|Ltd|Pvt|Govt)\.",
    re.IGNORECASE,
)
# single-letter initials: "M. Jafar", "C.J.", "A.O.R."
_INITIAL = re.compile(r"\b([A-Z])\.")

_MASK = "․"  # ONE DOT LEADER — visually a dot, never appears in input

_BOUNDARY = re.compile(r"(?<=[.!?])\s+")


def split_sentences(text: str, min_words: int = 5) -> list[str]:
    flat = " ".join(text.split())
    masked = _ABBREVIATIONS.sub(lambda m: m.group(0)[:-1] + _MASK, flat)
    masked = _INITIAL.sub(r"\1" + _MASK, masked)
    sentences = []
    for part in _BOUNDARY.split(masked):
        sentence = part.replace(_MASK, ".").strip()
        if len(sentence.split()) >= min_words:
            sentences.append(sentence)
    return sentences
