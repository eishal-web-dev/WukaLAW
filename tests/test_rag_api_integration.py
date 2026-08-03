from apps.api.app.routers import rag
from ai.rag.llm_provider import FakeLLMProvider
from ai.rag.rag_pipeline import RagPipeline
class EmptyRetriever:
 def search(self,q):return []
def test_api_response_includes_integrated_fields(monkeypatch):
 monkeypatch.setattr(rag,"get_pipeline",lambda:RagPipeline(EmptyRetriever(),FakeLLMProvider()))
 response=rag.query_rag(rag.RagQueryRequest(question="What does Article 25 provide?"))
 assert response.original_question and response.retrieval_query
 assert response.legal_intelligence is not None and response.validation_status=="INSUFFICIENT_EVIDENCE"
def test_api_legacy_flag(monkeypatch):
 monkeypatch.setattr(rag,"get_pipeline",lambda:RagPipeline(EmptyRetriever(),FakeLLMProvider()))
 response=rag.query_rag(rag.RagQueryRequest(question="What law applies?",use_legal_intelligence=False))
 assert response.legal_intelligence is None
