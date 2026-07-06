import io

from tests.conftest import SAMPLE_JUDGMENT


def _upload(client, filename="sample_case.txt", content=SAMPLE_JUDGMENT):
    return client.post(
        "/api/v1/documents/upload",
        files={"file": (filename, io.BytesIO(content.encode()), "text/plain")},
    )


def test_health(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_upload_and_list_and_detail(client):
    response = _upload(client)
    assert response.status_code == 201, response.text
    body = response.json()
    assert body["num_chunks"] >= 1
    assert body["title"] == "sample case"

    listing = client.get("/api/v1/documents").json()
    assert listing["total"] == 1

    detail = client.get(f"/api/v1/documents/{body['id']}").json()
    assert "supreme court" in detail["text"].lower()
    assert detail["summary"] is None


def test_upload_rejects_unsupported_type(client):
    response = client.post(
        "/api/v1/documents/upload",
        files={"file": ("evil.exe", io.BytesIO(b"xx"), "application/octet-stream")},
    )
    assert response.status_code == 400


def test_upload_rejects_empty_and_tiny_files(client):
    assert _upload(client, content="").status_code == 400
    assert _upload(client, content="too short").status_code == 422


def test_document_not_found(client):
    assert client.get("/api/v1/documents/999").status_code == 404


def test_summarize(client):
    document_id = _upload(client).json()["id"]
    response = client.post(f"/api/v1/documents/{document_id}/summarize")
    assert response.status_code == 200
    summary = response.json()["summary"]
    assert summary["short_summary"]
    assert any("Section 302" in point for point in summary["legal_points"])
    assert "allowed" in summary["outcome"].lower() or "set aside" in summary["outcome"].lower()


def test_similar_cases(client):
    _upload(client)
    response = client.post(
        "/api/v1/similar-cases", json={"query": "eyewitness testimony reliability", "top_k": 3}
    )
    assert response.status_code == 200
    results = response.json()["results"]
    assert results, "expected at least one similar chunk"
    assert results[0]["document_title"] == "sample case"
    assert 0 <= results[0]["score"] <= 1.01


def test_ask_returns_answer_with_sources(client):
    _upload(client)
    response = client.post("/api/v1/ask", json={"question": "What happened to the appeal?"})
    assert response.status_code == 200
    body = response.json()
    assert body["sources"], "answer must always carry sources"
    assert body["confidence"]["level"] in {"high", "medium", "low"}
    assert body["answer"]


def test_ask_with_no_documents_says_not_enough_info(client):
    response = client.post("/api/v1/ask", json={"question": "What is Section 302?"})
    assert response.status_code == 200
    body = response.json()
    assert body["sources"] == []
    assert "Not enough information" in body["answer"]
