"""Construct an evidence-only legal research prompt."""
from __future__ import annotations

from .models import ContextItem, QueryAnalysis


def _history_block(history) -> str:
    turns = [t for t in (history or []) if getattr(t, "content", "").strip()]
    if not turns:
        return ""
    lines = "\n".join(
        f"{'User' if t.role == 'user' else 'Assistant'}: {t.content.strip()}" for t in turns
    )
    return (
        "CONVERSATION SO FAR\n"
        "Use this only to understand what the current question refers to. "
        "Still answer strictly from the retrieved evidence.\n"
        f"{lines}\n\n"
    )


def build_prompt(analysis: QueryAnalysis, context: list[ContextItem], history=None) -> str:
    evidence = "\n\n".join(
        f"[{item.citation.id}] title={item.citation.document_title or 'unknown'}; "
        f"court={item.citation.court or 'unknown'}; case={item.citation.case_number or 'unknown'}; "
        f"chunk_id={item.citation.chunk_id}\n{item.text}" for item in context
    ) or "NO RETRIEVED EVIDENCE"
    conversation = _history_block(history)
    return f"""SYSTEM
You are WakuLAW, a legal research assistant. You provide evidence-grounded information, not legal advice or outcome predictions.

SAFETY RULES
- Use only the RETRIEVED LEGAL EVIDENCE below.
- Never fabricate facts, laws, articles, sections, case numbers, holdings, or citations.
- Cite claims with the exact citation identifiers shown, such as [C1].
- If the evidence is insufficient, say exactly: INSUFFICIENT_EVIDENCE.
- Do not draft legal documents and do not predict win or loss.

RETRIEVED LEGAL EVIDENCE
{evidence}

{conversation}CONVERSATION QUESTION
{analysis.normalized_question}

REQUIRED RESPONSE FORMAT
Answer in concise prose with inline [C#] citations. State limitations where relevant. Do not include citations absent from the evidence.
"""
