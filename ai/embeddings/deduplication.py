"""Exact-only canonical chunk selection."""
from __future__ import annotations
import hashlib,re
from dataclasses import dataclass,field
from typing import Any
def normalized_text(text:str)->str:return " ".join(text.split()).casefold()
def text_hash(text:str)->str:return hashlib.sha256(normalized_text(text).encode()).hexdigest()
def richness(record:dict[str,Any])->int:
    fields=("court","jurisdiction","case_category","case_number","title","heading","section_number","article_number","explicit_outcome_phrase","legal_citations","laws_cited","sections_cited","articles_cited")
    return sum(record.get(x) not in (None,"",[]) for x in fields)
def preference(record:dict[str,Any])->tuple:
    useful=record.get("source_dataset")=="labeled_cases" and bool(record.get("case_category"))
    return (-int(useful),-richness(record),len(str(record.get("source_path") or "")),str(record.get("chunk_id") or ""))
@dataclass
class CanonicalGroup:
    duplicate_hash:str;text_hash:str;canonical_chunk_id:str;score:tuple;source_chunk_ids:list[str]=field(default_factory=list)
    def consider(self,record):
        cid=str(record["chunk_id"]);self.source_chunk_ids.append(cid);score=preference(record)
        if score<self.score:self.score=score;self.canonical_chunk_id=cid
def group_key(record):
    value=str(record.get("duplicate_hash") or "");return value or text_hash(str(record.get("text") or ""))
def add_record(groups:dict[str,CanonicalGroup],record:dict[str,Any]):
    text=str(record.get("text") or "");key=group_key(record);th=text_hash(text);cid=str(record["chunk_id"])
    if key not in groups:groups[key]=CanonicalGroup(key,th,cid,preference(record),[cid])
    else:groups[key].consider(record)
