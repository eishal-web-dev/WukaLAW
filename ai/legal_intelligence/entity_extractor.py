"""Regex and dictionary extraction of entities explicitly present in a query."""
from __future__ import annotations
import re

_PATTERNS = {
    "acts": re.compile(r"\b([A-Z][A-Za-z&' -]{2,70}\s(?:Act|Ordinance|Code)(?:,?\s*(?:19|20)\d{2})?)\b"),
    "articles": re.compile(r"\bArticle\s+([0-9]+(?:\([A-Za-z0-9]+\))*)", re.I),
    "sections": re.compile(r"\b(?:Section|Sec\.)\s+([0-9]+[A-Za-z]?(?:\([A-Za-z0-9]+\))*)", re.I),
    "rules": re.compile(r"\bRule\s+([0-9]+[A-Za-z]?(?:\([A-Za-z0-9]+\))*)", re.I),
    "case_numbers": re.compile(r"\b(?:case|appeal|petition|suit|writ)\s*(?:no\.?|number|#)?\s*([A-Z0-9][A-Z0-9./-]{2,})", re.I),
    "courts": re.compile(r"\b((?:Supreme|Federal Shariat|[A-Za-z]+ High|District|Sessions?|Family|Civil|Banking|Labour|Service Tribunal|Magistrates?) Court|Supreme Court|High Court)\b", re.I),
    "judges": re.compile(r"\b(?:Justice|Judge|Mr\. Justice|Ms\. Justice)\s+([A-Z][A-Za-z.'-]+(?:\s+[A-Z][A-Za-z.'-]+){0,4})"),
    "money_amounts": re.compile(r"(?:\b(?:PKR|Rs\.?|Rupees?)\s*\d(?:[\d,]*\d)?(?:\.\d{1,2})?|\b\d(?:[\d,]*\d)?\s*(?:rupees|PKR)\b)", re.I),
    "dates": re.compile(r"\b(?:\d{1,2}[-/.]\d{1,2}[-/.](?:\d{2}|\d{4})|\d{1,2}\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(?:19|20)\d{2})\b", re.I),
    "cnic": re.compile(r"\b\d{5}-\d{7}-\d\b"),
    "fir": re.compile(r"\bFIR\b\s*(?:No\.?|#)?\s*([A-Z0-9/-]+)", re.I),
}

_CONCEPTS = {
    "nikahnama": ("nikahnama", "nikah nama"), "dowry": ("dowry", "jahez", "dower"),
    "inheritance": ("inheritance", "heir", "succession"), "property": ("property", "land", "house", "plot"),
    "cheque": ("cheque", "check dishonour", "dishonoured cheque"), "bail": ("bail",),
    "divorce": ("divorce", "khula", "talaq"), "custody": ("custody", "guardianship"),
    "employment": ("employment", "employee", "employer", "boss", "fired", "dismissal", "job"),
    "tax": ("tax", "fbr"), "company": ("company", "corporation", "director", "shareholder"),
    "contract": ("contract", "agreement", "breach"),
    "crime_keywords": ("murder", "theft", "fraud", "assault", "kidnapping", "rape", "harassment", "arrest", "accused"),
}


def extract_entities(text: str) -> dict[str, list[str]]:
    entities: dict[str, list[str]] = {}
    for name, pattern in _PATTERNS.items():
        values = []
        for match in pattern.finditer(text):
            value = match.group(1) if match.lastindex else match.group(0)
            if value not in values:
                values.append(value.strip())
        if values:
            entities[name] = values
    lowered = text.casefold()
    for name, terms in _CONCEPTS.items():
        values = [term for term in terms if re.search(r"\b" + re.escape(term) + r"\b", lowered)]
        if values:
            entities[name] = values
    return entities
