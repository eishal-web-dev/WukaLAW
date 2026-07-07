import io

from tests.conftest import SAMPLE_JUDGMENT, register_user


def _upload(client, headers, filename="sample_case.txt", content=SAMPLE_JUDGMENT):
    return client.post(
        "/api/v1/documents/upload",
        files={"file": (filename, io.BytesIO(content.encode()), "text/plain")},
        headers=headers,
    )


def test_health(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_upload_and_list_and_detail(client):
    headers = register_user(client)
    response = _upload(client, headers)
    assert response.status_code == 201, response.text
    body = response.json()
    assert body["num_chunks"] >= 1
    assert body["title"] == "sample case"

    listing = client.get("/api/v1/documents", headers=headers).json()
    assert listing["total"] == 1

    detail = client.get(f"/api/v1/documents/{body['id']}", headers=headers).json()
    assert "supreme court" in detail["text"].lower()
    assert detail["summary"] is None


def test_upload_rejects_unsupported_type(client):
    headers = register_user(client)
    response = client.post(
        "/api/v1/documents/upload",
        files={"file": ("evil.exe", io.BytesIO(b"xx"), "application/octet-stream")},
        headers=headers,
    )
    assert response.status_code == 400


def test_upload_rejects_empty_and_tiny_files(client):
    headers = register_user(client)
    assert _upload(client, headers, content="").status_code == 400
    assert _upload(client, headers, content="too short").status_code == 422


def test_document_not_found(client):
    headers = register_user(client)
    assert client.get("/api/v1/documents/999", headers=headers).status_code == 404


def test_summarize(client):
    headers = register_user(client)
    document_id = _upload(client, headers).json()["id"]
    response = client.post(f"/api/v1/documents/{document_id}/summarize", headers=headers)
    assert response.status_code == 200
    summary = response.json()["summary"]
    assert summary["short_summary"]
    assert any("Section 302" in point for point in summary["legal_points"])
    assert "allowed" in summary["outcome"].lower() or "set aside" in summary["outcome"].lower()


def test_similar_cases(client):
    headers = register_user(client)
    _upload(client, headers)
    response = client.post(
        "/api/v1/similar-cases",
        json={"query": "eyewitness testimony reliability", "top_k": 3},
        headers=headers,
    )
    assert response.status_code == 200
    results = response.json()["results"]
    assert results, "expected at least one similar chunk"
    assert results[0]["document_title"] == "sample case"
    assert 0 <= results[0]["score"] <= 1.01


def test_ask_returns_answer_with_sources(client):
    headers = register_user(client)
    _upload(client, headers)
    response = client.post(
        "/api/v1/ask", json={"question": "What happened to the appeal?"}, headers=headers
    )
    assert response.status_code == 200
    body = response.json()
    assert body["sources"], "answer must always carry sources"
    assert body["confidence"]["level"] in {"high", "medium", "low"}
    assert body["answer"]


def test_ask_with_no_documents_says_not_enough_info(client):
    headers = register_user(client)
    response = client.post(
        "/api/v1/ask", json={"question": "What is Section 302?"}, headers=headers
    )
    assert response.status_code == 200
    body = response.json()
    assert body["sources"] == []
    assert "Not enough information" in body["answer"]


def test_irrelevant_query_returns_no_similar_cases(client):
    headers = register_user(client)
    _upload(client, headers)
    response = client.post(
        "/api/v1/similar-cases", json={"query": "completely unrelated gibberish zzz"}, headers=headers
    )
    assert response.status_code == 200
    assert response.json()["results"] == []


def test_irrelevant_question_refuses_without_sources(client):
    headers = register_user(client)
    _upload(client, headers)
    response = client.post(
        "/api/v1/ask", json={"question": "completely unrelated gibberish zzz"}, headers=headers
    )
    body = response.json()
    assert "Not enough information" in body["answer"]
    assert body["sources"] == []
    assert body["confidence"]["level"] == "low"
