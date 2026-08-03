"""Concise query text preparation without legal answer generation."""
from .models import LegalSearchQuery
def build_query_text(query:LegalSearchQuery)->str:
    lines=[query.query.strip()]
    if query.document_types:lines.append("Document type: "+", ".join(query.document_types))
    if query.case_categories:lines.append("Case category: "+", ".join(query.case_categories))
    if query.section_numbers:lines.append("Section: "+", ".join(query.section_numbers))
    if query.article_numbers:lines.append("Article: "+", ".join(query.article_numbers))
    return "\n".join(lines)
