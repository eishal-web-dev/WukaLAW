"""Grounded, client-friendly briefs for historical precedents.

The endpoint retrieves multiple chunks from one exact judgment and asks the
configured RAG LLM to summarize only those passages. Missing information must
remain explicitly unavailable rather than being invented.
"""
from __future__ import annotations

import json
import re
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from ai.retrieval.models import LegalSearchQuery
from app.auth import get_current_user
from app.db import get_db
from app.models import Case, Document, User

router = APIRouter(prefix="/cases", tags=["precedent-briefs"])


def _owned_case(db: Session, case_id: int, user: User) -> Case:
    case = db.get(Case, case_id)
    if case is None or case.owner_id != user.id:
        raise HTTPException(status_code=404, detail="Case not found.")
    return case


def _clean_json(text: str) -> dict[str, Any]:
    value = (text or "").strip()
    if value.startswith("```"):
        value = re.sub(r"^```(?:json)?\s*", "", value, flags=re.I)
        value = re.sub(r"\s*```$", "", value)
    try:
        parsed = json.loads(value)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", value, flags=re.S)
        if not match:
            raise RuntimeError("The AI returned an invalid case-brief format")
        parsed = json.loads(match.group(0))
    if not isinstance(parsed, dict):
        raise RuntimeError("The AI returned an invalid case-brief object")
    return parsed


def _list(value: Any) -> list[str]:
    if not isinstance(value, list):
        return []
    return [str(item).strip() for item in value if str(item).strip()]


def _text(value: Any) -> str:
    text = str(value or "").strip()
    return text or "Not available in the indexed judgment passages."


@router.get("/{case_id}/precedent-brief")
def precedent_brief(
    case_id: int,
    document_id: str = Query(min_length=1, max_length=240),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Create a grounded case brief for one retrieved historical judgment."""
    case = _owned_case(db, case_id, user)
    documents = db.scalars(
        select(Document).where(Document.case_id == case.id).order_by(Document.created_at.desc())
    ).all()

    case_facts = " ".join(
        part for part in [case.title or "", case.case_type or "", case.description or ""] if part
    ).strip()
    for document in documents[:3]:
        if document.text:
            case_facts += " " + " ".join(document.text.split())[:1800]

    try:
        from app.routers.rag import get_pipeline

        pipeline = get_pipeline()
        # Search the exact matched historical judgment from several angles so the
        # context contains facts, procedural history, reasoning and final order.
        queries = [
            f"{case_facts} facts background dispute parties evidence",
            "procedural history trial court family court high court appeal petition previous decision",
            "legal issues questions before the court applicable law sections articles",
            "court reasoning findings analysis evidence principles",
            "final decision order appeal allowed dismissed decree relief outcome",
        ]
        chunks = []
        seen: set[str] = set()
        for query in queries:
            rows = pipeline.retriever.search(
                LegalSearchQuery(
                    query=query,
                    top_k=12,
                    document_types=["judgment"],
                    document_ids=[document_id],
                )
            )
            for row in rows:
                if row.canonical_chunk_id in seen:
                    continue
                seen.add(row.canonical_chunk_id)
                chunks.append(row)

        if not chunks:
            raise HTTPException(status_code=404, detail="Historical judgment passages were not found.")

        # Preserve multiple passages but cap the prompt to keep latency/cost bounded.
        passages = []
        total_chars = 0
        for index, row in enumerate(chunks, 1):
            text = (row.text_preview or "").strip()
            if not text:
                continue
            block = f"[P{index}] {text}"
            if total_chars + len(block) > 24000:
                break
            passages.append(block)
            total_chars += len(block)

        if not passages:
            raise HTTPException(status_code=404, detail="Historical judgment text was unavailable.")

        prompt = f"""You are preparing a Pakistani case-law brief for a legal decision-support product.
Use ONLY the indexed judgment passages supplied below. Do not use outside knowledge.
Do not guess party facts, procedural events, holdings, outcomes, dates, evidence, or relief.
If a requested item is not supported, write exactly: \"Not available in the indexed judgment passages.\"

CLIENT CASE FACTS:
{case_facts or 'No detailed client facts supplied.'}

HISTORICAL JUDGMENT PASSAGES:
{chr(10).join(passages)}

Return ONLY valid JSON with this exact schema:
{{
  "case_overview": "2-4 sentence plain-English overview of the historical case",
  "background_facts": ["fact 1", "fact 2"],
  "procedural_history": ["Step 1 ...", "Step 2 ...", "Step 3 ..."],
  "legal_issues": ["issue 1", "issue 2"],
  "court_reasoning": ["reason 1", "reason 2"],
  "final_decision": "what the court finally decided",
  "relief_or_order": "specific order/relief if supported",
  "similarities_to_client": ["specific similarity 1", "specific similarity 2"],
  "important_differences": ["difference/limitation 1", "difference/limitation 2"],
  "how_it_may_help": ["practical way this precedent may support or caution the client"],
  "key_laws": ["law/section/article supported by passages"],
  "evidence_limitations": "what important information is missing from the indexed passages"
}}
"""
        raw = pipeline.llm.generate(prompt)
        brief = _clean_json(raw)
    except HTTPException:
        raise
    except (RuntimeError, ValueError) as exc:
        raise HTTPException(status_code=503, detail=f"Could not generate precedent brief: {exc}") from exc

    first = chunks[0]
    return {
        "document_id": document_id,
        "title": first.title,
        "court": first.court,
        "case_number": first.case_number,
        "passages_reviewed": len(passages),
        "case_overview": _text(brief.get("case_overview")),
        "background_facts": _list(brief.get("background_facts")),
        "procedural_history": _list(brief.get("procedural_history")),
        "legal_issues": _list(brief.get("legal_issues")),
        "court_reasoning": _list(brief.get("court_reasoning")),
        "final_decision": _text(brief.get("final_decision")),
        "relief_or_order": _text(brief.get("relief_or_order")),
        "similarities_to_client": _list(brief.get("similarities_to_client")),
        "important_differences": _list(brief.get("important_differences")),
        "how_it_may_help": _list(brief.get("how_it_may_help")),
        "key_laws": _list(brief.get("key_laws")),
        "evidence_limitations": _text(brief.get("evidence_limitations")),
        "disclaimer": "AI-generated summary of indexed judgment passages for research support; verify against the official judgment before relying on it.",
    }
