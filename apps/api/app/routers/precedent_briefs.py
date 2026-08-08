"""Grounded, client-friendly briefs for historical precedents.

Qdrant identifies a matching judgment. For the detailed brief we prefer the
original source file stored in the configured S3-compatible bucket (Supabase in
local WakuLAW development). If the source file cannot be read, the endpoint
falls back to the indexed passages. The LLM is instructed to distinguish
historical-case facts from the user's explicitly supplied facts.
"""
from __future__ import annotations

import io
import json
import re
from pathlib import PurePosixPath
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from ai.retrieval.models import LegalSearchQuery
from app.auth import get_current_user
from app.config import settings
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
    return text or "Not available in the supplied judgment record."


def _s3_client():
    if not settings.aws_s3_bucket:
        return None
    try:
        import boto3
    except ImportError:
        return None
    kwargs: dict[str, Any] = {"region_name": settings.aws_region}
    if settings.aws_s3_endpoint_url:
        kwargs["endpoint_url"] = settings.aws_s3_endpoint_url
    return boto3.client("s3", **kwargs)


def _dataset_keys(source_path: str) -> list[str]:
    cleaned = (source_path or "").replace("\\", "/").lstrip("/")
    keys: list[str] = []
    if cleaned.startswith("datasets/"):
        keys.append(cleaned)
    else:
        keys.append(f"datasets/raw/{cleaned}")
        keys.append(cleaned)
    return list(dict.fromkeys(keys))


def _decode_source_file(body: bytes, source_path: str) -> str | None:
    suffix = PurePosixPath(source_path).suffix.casefold()
    if suffix in {".txt", ".md", ".json", ".jsonl", ".csv"}:
        return body.decode("utf-8", errors="replace")
    if suffix == ".pdf":
        try:
            from pypdf import PdfReader
            reader = PdfReader(io.BytesIO(body))
            return "\n".join((page.extract_text() or "") for page in reader.pages)
        except Exception:
            return None
    return body.decode("utf-8", errors="replace")


def _full_source_text(source_path: str) -> tuple[str | None, str | None]:
    client = _s3_client()
    if client is None:
        return None, None
    for key in _dataset_keys(source_path):
        try:
            response = client.get_object(Bucket=settings.aws_s3_bucket, Key=key)
            body = response["Body"].read()
        except Exception:
            continue
        text = _decode_source_file(body, source_path)
        if text and text.strip():
            return " ".join(text.split()), key
    return None, None


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

    # Keep user-supplied facts separate from classification hints. The LLM may
    # compare only against this section and must not promote inferred topics into
    # facts about the user's case.
    explicit_case_facts = (case.description or "").strip()
    client_documents: list[str] = []
    for document in documents[:3]:
        if document.text:
            client_documents.append(" ".join(document.text.split())[:2200])
    client_record = explicit_case_facts
    if client_documents:
        client_record += ("\n" if client_record else "") + "\n".join(client_documents)

    try:
        from app.routers.rag import get_pipeline

        pipeline = get_pipeline()
        search_seed = " ".join(
            part for part in [case.case_type or "", explicit_case_facts or ""] if part
        ).strip()
        queries = [
            f"{search_seed} facts background dispute parties evidence",
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
                    top_k=20,
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

        first = chunks[0]
        full_text, source_key = _full_source_text(first.source_path)

        if full_text:
            # A full judgment can be very long. Keep both the beginning and the
            # ending because party facts often appear near the start and the final
            # order is commonly near the end.
            if len(full_text) > 60000:
                historical_record = full_text[:42000] + "\n\n[...middle omitted...]\n\n" + full_text[-18000:]
            else:
                historical_record = full_text
            record_source = "full_source_file"
            passages_reviewed = max(len(chunks), 1)
        else:
            blocks: list[str] = []
            total_chars = 0
            for index, row in enumerate(chunks, 1):
                text = (row.text_preview or "").strip()
                if not text:
                    continue
                block = f"[P{index}] {text}"
                if total_chars + len(block) > 30000:
                    break
                blocks.append(block)
                total_chars += len(block)
            if not blocks:
                raise HTTPException(status_code=404, detail="Historical judgment text was unavailable.")
            historical_record = "\n".join(blocks)
            record_source = "indexed_passages"
            passages_reviewed = len(blocks)

        limited_client_facts = len(explicit_case_facts) < 40 and not client_documents
        comparison_rule = (
            "The client has supplied very limited facts. Do NOT claim factual similarity. "
            "For similarities_to_client, list only literal topic overlap explicitly present in CLIENT-SUPPLIED FACTS. "
            "For how_it_may_help, describe only what legal principle the precedent may illustrate, not a predicted benefit."
            if limited_client_facts
            else
            "Compare only facts explicitly present in CLIENT-SUPPLIED FACTS/CLIENT DOCUMENT EXCERPTS. "
            "Never infer a client fact merely because it appears in the historical judgment."
        )

        prompt = f"""You are preparing a Pakistani case-law brief for a legal decision-support product.
Use ONLY the historical judgment record supplied below for statements about the precedent.
Use ONLY CLIENT-SUPPLIED FACTS and CLIENT DOCUMENT EXCERPTS for statements about the user's case.
Do not use outside knowledge. Do not guess party facts, procedural events, holdings, outcomes, dates, evidence, relief, or client circumstances.
{comparison_rule}
If a requested historical-case item is unsupported, write exactly: "Not available in the supplied judgment record."

CLIENT CASE LABEL (classification only; NOT a factual assertion):
Title: {case.title}
Type: {case.case_type}

CLIENT-SUPPLIED FACTS:
{explicit_case_facts or 'No detailed client facts supplied.'}

CLIENT DOCUMENT EXCERPTS:
{chr(10).join(client_documents) if client_documents else 'No client documents supplied.'}

HISTORICAL JUDGMENT RECORD:
{historical_record}

Return ONLY valid JSON with this exact schema:
{{
  "case_overview": "2-4 sentence plain-English overview of the historical case",
  "background_facts": ["fact 1", "fact 2"],
  "procedural_history": ["Step 1 ...", "Step 2 ...", "Step 3 ..."],
  "legal_issues": ["issue 1", "issue 2"],
  "court_reasoning": ["reason 1", "reason 2"],
  "final_decision": "what the court finally decided",
  "relief_or_order": "specific order/relief if supported",
  "similarities_to_client": ["ONLY explicit overlap supported by both records"],
  "important_differences": ["difference or missing client fact that limits comparison"],
  "how_it_may_help": ["legal principle or procedural lesson this precedent may illustrate; no outcome prediction"],
  "key_laws": ["law/section/article supported by the historical record"],
  "evidence_limitations": "important information missing from either record that limits the comparison"
}}
"""
        raw = pipeline.llm.generate(prompt)
        brief = _clean_json(raw)
    except HTTPException:
        raise
    except (RuntimeError, ValueError) as exc:
        raise HTTPException(status_code=503, detail=f"Could not generate precedent brief: {exc}") from exc

    return {
        "document_id": document_id,
        "title": first.title,
        "court": first.court,
        "case_number": first.case_number,
        "passages_reviewed": passages_reviewed,
        "record_source": record_source,
        "full_source_key": source_key,
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
        "disclaimer": "AI-generated summary for research support. Historical facts and outcomes are grounded in the retrieved source record; verify against the official judgment before relying on it.",
    }
