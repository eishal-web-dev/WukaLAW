"""Structure-preserving legal chunker with deterministic IDs and offsets."""
from __future__ import annotations
import hashlib, re
from dataclasses import dataclass
from typing import Any
from apps.api.ai.preprocessing.sentences import split_sentences
from .models import LegalChunk
from .tokenizer import estimate_tokens

_LAW = re.compile(r"^\s*(?:(PART|CHAPTER)\s+([IVXLCDM\d]+)|ARTICLE\s+([\dA-Za-z-]+)|SECTION\s+([\dA-Za-z-]+)|([0-9]+[A-Za-z]?)\s*[.)]\s+\S)", re.I)
_JHEAD = re.compile(r"^\s*(JUDGMENT|ORDER|FACTS|BACKGROUND|ISSUES?|SUBMISSIONS?|ARGUMENTS?|EVIDENCE|REASONS?|REASONING|FINDINGS?|CONCLUSION|DECISION|FINAL ORDER)\s*[:.-]?\s*$", re.I)
_NUMPAR = re.compile(r"^\s*(?:\[\d+\]|\d+[.)])\s+\S")
_THEAD = re.compile(r"^\s*(TITLE|PARTIES|FACTS|GROUNDS|PRAYER|VERIFICATION|AFFIDAVIT|SIGNATURES?)\s*[:.-]?\s*$", re.I)

@dataclass(frozen=True)
class ChunkingConfig:
    target_tokens: int = 700; min_tokens: int = 250; max_tokens: int = 1000; overlap_tokens: int = 100
    def __post_init__(self) -> None:
        if not (0 <= self.overlap_tokens < self.target_tokens <= self.max_tokens): raise ValueError("require 0 <= overlap < target <= maximum")
        if not (0 < self.min_tokens <= self.target_tokens): raise ValueError("require 0 < minimum <= target")
@dataclass
class _Unit:
    start: int; end: int; text: str; kind: str; heading: str | None = None
    section: str | None = None; article: str | None = None
def _norm(text: str) -> str: return " ".join(text.split()).casefold()
def _id(doc: str, index: int, text: str) -> str:
    return "wc_" + hashlib.sha256(f"{doc}\0{index}\0{_norm(text)}".encode()).hexdigest()[:32]
def _marker(line: str, dtype: str):
    if dtype in {"law","act","ordinance","constitution"}:
        m=_LAW.match(line)
        if m:
            section=m.group(4) or m.group(5); article=m.group(3)
            return ("article" if article else "section" if section else m.group(1).casefold(),section,article)
    elif dtype in {"judgment","case","labeled_case"}:
        m=_JHEAD.match(line)
        if m:return (m.group(1).casefold().replace(" ","_"),None,None)
        if _NUMPAR.match(line):return ("paragraph",None,None)
    else:
        m=_THEAD.match(line)
        if m:return (m.group(1).casefold(),None,None)
    return None
def _units(text: str, dtype: str) -> list[_Unit]:
    starts=[]; offset=0
    for line in text.splitlines(keepends=True):
        marker=_marker(line.rstrip("\r\n"),dtype)
        if marker:starts.append((offset,*marker,line.strip()))
        offset+=len(line)
    if not starts or starts[0][0]!=0: starts.insert(0,(0,"case_header" if dtype in {"judgment","case","labeled_case"} else "body",None,None,""))
    out=[]
    for i,(start,kind,section,article,heading) in enumerate(starts):
        end=starts[i+1][0] if i+1<len(starts) else len(text); value=text[start:end]
        if value.strip():out.append(_Unit(start,end,value,kind,heading or None,section,article))
    return out
def _slices(unit: _Unit, maximum: int, overlap: int):
    if len(unit.text)<=maximum:return [(0,len(unit.text),0,[])]
    bounds=[0,len(unit.text)]+[m.end() for m in re.finditer(r"\n\s*\n|\n(?=\s*(?:\([a-z0-9]+\)|\[?\d+\]?[.)]))",unit.text,re.I)]
    if len(set(bounds))<=2:
        cursor=0
        for sentence in split_sentences(unit.text,min_words=1):
            pos=unit.text.find(sentence,cursor)
            if pos>=0:bounds.append(pos+len(sentence));cursor=pos+len(sentence)
    bounds=sorted(set(bounds));out=[];start=0
    while start<len(unit.text):
        core_budget=maximum if not out else max(1,maximum-overlap)
        candidates=[b for b in bounds if start<b<=min(len(unit.text),start+core_budget)]
        end=max(candidates) if candidates else min(len(unit.text),start+core_budget)
        warnings=[] if end in bounds else ["oversized_indivisible_structure_split"]
        shown=start; ov=0
        if out and overlap:
            prior=[b for b in bounds if max(0,start-overlap)<=b<start]
            if prior: shown=max(prior)
            else: shown=max(0,start-overlap)
            ov=start-shown
        out.append((shown,end,ov,warnings));start=end
    return out
def _type(dtype: str, kind: str, value: str, outcomes: list[str]) -> str:
    if any(x.casefold() in value.casefold() for x in outcomes):return "outcome"
    if dtype in {"judgment","case","labeled_case"}:
        if kind=="case_header":return "case_header"
        if kind in {"reasons","reasoning","findings","analysis"}:return "reasoning"
        return "judgment_body"
    return kind
def chunk_document(record: dict[str,Any], config: ChunkingConfig, *, created_at: str) -> list[LegalChunk]:
    text=record.get("cleaned_text","")
    if not isinstance(text,str) or not text.strip():return []
    doc=str(record.get("document_id") or "")
    if not doc:raise ValueError("missing document_id")
    dtype=str(record.get("document_type") or "unknown").casefold(); meta=record.get("task_003_metadata") or {}
    raw_units=_units(text,dtype); packed=[]; pending=[]
    for unit in raw_units:
        if len(unit.text)>config.max_tokens*4:
            if pending:
                first=pending[0]; last=pending[-1]; packed.append(_Unit(first.start,last.end,text[first.start:last.end],first.kind,first.heading,first.section if len(pending)==1 else None,first.article if len(pending)==1 else None));pending=[]
            packed.append(unit);continue
        proposed=sum(len(item.text) for item in pending)+len(unit.text)
        if pending and proposed>config.target_tokens*4:
            first=pending[0]; last=pending[-1]; packed.append(_Unit(first.start,last.end,text[first.start:last.end],first.kind,first.heading,first.section if len(pending)==1 else None,first.article if len(pending)==1 else None));pending=[]
        pending.append(unit)
    if pending:
        first=pending[0]; last=pending[-1]; packed.append(_Unit(first.start,last.end,text[first.start:last.end],first.kind,first.heading,first.section if len(pending)==1 else None,first.article if len(pending)==1 else None))
    if len(packed)>1 and estimate_tokens(packed[-1].text)<config.min_tokens and len(packed[-2].text)+len(packed[-1].text)<=config.max_tokens*4:
        first=packed[-2]; last=packed[-1]; packed[-2:]=[_Unit(first.start,last.end,text[first.start:last.end],first.kind,first.heading,None,None)]
    pieces=[]
    for unit in packed:
        for a,b,ov,w in _slices(unit,config.max_tokens*4,config.overlap_tokens*4):pieces.append((unit,unit.start+a,unit.start+b,ov,w))
    if len(pieces)>1:
        last=pieces[-1]; previous=pieces[-2]
        if estimate_tokens(text[last[1]:last[2]])<config.min_tokens and last[2]-previous[1]<=config.max_tokens*4:
            pieces[-2:]=[(previous[0],previous[1],last[2],previous[3],previous[4])]
    outcomes=list(meta.get("explicit_outcome_phrases") or []);chunks=[]
    for i,(unit,start,end,ov,warnings) in enumerate(pieces):
        value=text[start:end].strip()
        if not value:continue
        tokens=estimate_tokens(value)
        if tokens>config.max_tokens:warnings=warnings+["above_hard_maximum_indivisible_clause"]
        contains=lambda values:[x for x in values if str(x).casefold() in value.casefold()]
        outcome=next((x for x in outcomes if x.casefold() in value.casefold()),None)
        ph=text.count("\n\n",0,start); dh=hashlib.sha256(_norm(value).encode()).hexdigest()
        chunks.append(LegalChunk(_id(doc,i,value),doc,doc,str(record.get("source_dataset") or ""),str(record.get("source_path") or ""),str(record.get("source_file_name") or ""),dtype,meta.get("court") or record.get("court"),meta.get("jurisdiction") or record.get("jurisdiction"),meta.get("case_category") or record.get("case_category"),meta.get("case_number") or record.get("case_number"),meta.get("title") or record.get("title"),record.get("language"),i,len(pieces),_type(dtype,unit.kind,value,outcomes),unit.heading,unit.section,unit.article,ph,ph+value.count("\n\n"),start,end,value,len(value),tokens,ov,contains(meta.get("legal_citations") or []),contains(meta.get("laws_cited") or []),contains(meta.get("sections_cited") or []),contains(meta.get("articles_cited") or []),outcome,dh,{"structural_kind":unit.kind},warnings,"task-004-v1",created_at))
    for i,c in enumerate(chunks):c.chunk_index=i;c.total_chunks=len(chunks);c.chunk_id=_id(doc,i,c.text)
    return chunks
