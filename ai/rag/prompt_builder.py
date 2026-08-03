"""Construct an evidence-only legal research prompt."""
from __future__ import annotations

from .models import ContextItem, QueryAnalysis


def build_prompt(analysis: QueryAnalysis, context: list[ContextItem]) -> str:
    evidence = "\n\n".join(
        f"[{item.citation.id}] title={item.citation.document_title or 'unknown'}; "
        f"court={item.citation.court or 'unknown'}; case={item.citation.case_number or 'unknown'}; "
        f"chunk_id={item.citation.chunk_id}\n{item.text}" for item in context
    ) or "NO RETRIEVED EVIDENCE"
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

CONVERSATION QUESTION
{analysis.normalized_question}

REQUIRED RESPONSE FORMAT
Answer in concise prose with inline [C#] citations. State limitations where relevant. Do not include citations absent from the evidence.
"""
