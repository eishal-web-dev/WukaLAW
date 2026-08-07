from ai.rag.context_builder import build_context
from ai.rag.llm_provider import FakeLLMProvider
from ai.rag.models import ValidationStatus
from ai.rag.rag_pipeline import RagPipeline
from ai.rag.response_validator import validate_response
from test_context_builder import result


def test_valid_grounded_answer_passes():
    context = build_context([result()])
    assert validate_response("Article 14 protects equality [C1].", context).status == ValidationStatus.PASS


def test_unknown_citation_and_invented_law_rejected():
    context = build_context([result()])
    validation = validate_response("The Imaginary Act applies in case XYZ/999 [C9].", context)
    assert validation.status == ValidationStatus.INSUFFICIENT_EVIDENCE
    assert any("Unknown citations" in reason for reason in validation.reasons)


def test_uncited_response_is_low_confidence():
    assert validate_response("Equality is protected.", build_context([result()])).status == ValidationStatus.LOW_CONFIDENCE


class FakeRetriever:
    def __init__(self, results): self.results = results; self.queries = []
    def search(self, query): self.queries.append(query); return self.results


def test_pipeline_uses_fake_dependencies():
    retriever = FakeRetriever([result()])
    llm = FakeLLMProvider("Article 14 protects equality [C1].")
    output = RagPipeline(retriever, llm).run("What does Article 14 protect?")
    assert output.validation.status == ValidationStatus.PASS
    assert llm.prompts and retriever.queries


def test_empty_retrieval_skips_llm():
    llm = FakeLLMProvider("must not be used")
    output = RagPipeline(FakeRetriever([]), llm).run("What does the law say?")
    assert output.validation.status == ValidationStatus.INSUFFICIENT_EVIDENCE
    assert llm.prompts == []
