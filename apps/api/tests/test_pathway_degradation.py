from types import SimpleNamespace
from app.routers import cases

class ScalarRows:
    def __init__(self, rows): self.rows = rows
    def all(self): return self.rows

class FakeDB:
    def __init__(self, case, documents): self.case, self.documents = case, documents
    def get(self, _model, _id): return self.case
    def scalars(self, _query): return ScalarRows(self.documents)

def test_similar_search_failure_keeps_current_stage(monkeypatch):
    user = SimpleNamespace(id=7)
    case = SimpleNamespace(
        id=1, owner_id=7, case_type="Family Case", description="The matter is fixed for final arguments.",
        case_number="F-1", title="Family matter", status="Active",
    )
    monkeypatch.setattr(cases, "_run_similar_search", lambda **_: (_ for _ in ()).throw(RuntimeError("offline")))
    result = cases.case_pathway_intelligence(1, 20, FakeDB(case, []), user)
    assert result["current_stage"]["key"] == "arguments"
    assert result["historical_pathway"]["available"] is False
    assert result["historical_timing"]["available"] is False
    assert result["historical_outcomes"]["available"] is False
    assert any("temporarily unavailable" in warning for warning in result["warnings"])
