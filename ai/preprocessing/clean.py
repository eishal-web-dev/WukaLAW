"""Clean raw legal text: normalize whitespace, drop page artifacts."""

import re

# lines that are only page numbers or common judgment page artifacts
_PAGE_NUMBER = re.compile(r"^\s*(page\s*)?[-–—]?\s*\d+\s*[-–—]?\s*$", re.IGNORECASE)


def clean_text(raw: str) -> str:
    lines = raw.splitlines()
    kept: list[str] = []
    for line in lines:
        if _PAGE_NUMBER.match(line):
            continue
        kept.append(line.strip())

    text = "\n".join(kept)
    text = re.sub(r"[ \t]+", " ", text)          # collapse horizontal whitespace
    text = re.sub(r"\n{3,}", "\n\n", text)        # collapse blank-line runs
    text = re.sub(r"(\w)-\n(\w)", r"\1\2", text)  # join words hyphenated across lines
    return text.strip()
