"""Structural and integrity tests for the legal-aware chunker."""
from ai.chunking.legal_chunker import ChunkingConfig,chunk_document

def record(text,dtype="law",dataset="laws"):
    return {"document_id":"doc-1","source_dataset":dataset,"source_path":"x","source_file_name":"x.txt","document_type":dtype,"jurisdiction":"Pakistan","language":"English","cleaned_text":text,"task_003_metadata":{"legal_citations":["PLD 2024 SC 15"],"laws_cited":["Penal Code"],"sections_cited":["302"],"articles_cited":["25"],"explicit_outcome_phrases":["appeal is dismissed"]}}
def config():return ChunkingConfig(target_tokens=40,min_tokens=10,max_tokens=60,overlap_tokens=8)
def test_law_sections_preserve_heading_number_and_citation():
    text="Section 1 Preliminary\n"+("opening words "*18)+"\nSection 302 Punishment\n"+("PLD 2024 SC 15 Penal Code Section 302 text. "*8)
    chunks=chunk_document(record(text),config(),created_at="fixed")
    assert any(c.section_number=="302" for c in chunks);assert any("Section 302 Punishment" in c.text for c in chunks)
    assert any("PLD 2024 SC 15" in c.legal_citations for c in chunks)
def test_constitution_articles_preserve_article_number():
    chunks=chunk_document(record("Article 24 Protection of property\n"+("Guarantee. "*30)+"\nArticle 25 Equality\n"+("Equal protection. "*30),"constitution"),config(),created_at="fixed")
    assert {c.article_number for c in chunks if c.article_number}>={"24","25"}
def test_judgment_numbered_paragraphs_and_outcome():
    text="IN THE SUPREME COURT\n1. Facts of the matter.\n2. "+("Reasoning sentence. "*20)+"\nFINAL ORDER\nThe appeal is dismissed."
    chunks=chunk_document(record(text,"judgment","judgments"),config(),created_at="fixed")
    assert any(c.chunk_type=="outcome" for c in chunks);assert "1. Facts" in "\n".join(c.text for c in chunks)
def test_oversized_section_splits_with_overlap_and_warning():
    text="Section 9 Long provision\n"+"\n\n".join("Sentence number %d has complete legal language."%i for i in range(50))
    chunks=chunk_document(record(text),config(),created_at="fixed")
    assert len(chunks)>1;assert any(c.overlap_from_previous>0 for c in chunks[1:]);assert all(c.estimated_token_count<=60 or c.warnings for c in chunks)
def test_avoids_tiny_tail_and_ids_are_deterministic():
    text="Section 1 One\n"+("alpha "*60)+"\nSection 2 Two\nshort ending"
    first=chunk_document(record(text),config(),created_at="one");second=chunk_document(record(text),config(),created_at="two")
    assert [c.chunk_id for c in first]==[c.chunk_id for c in second]
    assert first[-1].estimated_token_count>=10 or len(first)==1
