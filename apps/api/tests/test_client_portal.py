from tests.conftest import register_user


def _make_client(email: str) -> None:
    from sqlalchemy import text

    from app.db import engine

    with engine.connect() as connection:
        connection.execute(text("UPDATE users SET role = 'client' WHERE email = :email"), {"email": email})
        connection.commit()


def test_client_sees_only_their_assigned_cases(client):
    lawyer = register_user(client, email="lawyer1@example.com")
    client_headers = register_user(client, email="client1@example.com")
    _make_client("client1@example.com")

    # Lawyer creates two cases, only one assigned to the client.
    r1 = client.post(
        "/api/v1/cases",
        json={"title": "Assigned Case", "case_type": "Civil", "status": "Active", "priority": "Medium"},
        headers=lawyer,
    )
    assert r1.status_code == 201
    assigned_case_id = r1.json()["id"]

    r2 = client.post(
        "/api/v1/cases",
        json={"title": "Unassigned Case", "case_type": "Civil", "status": "Active", "priority": "Medium"},
        headers=lawyer,
    )
    assert r2.status_code == 201

    # Get the client's real user id to assign the case to them.
    me = client.get("/api/v1/auth/me", headers=client_headers).json()
    client.patch(f"/api/v1/cases/{assigned_case_id}", json={"client_id": me["id"]}, headers=lawyer)

    response = client.get("/api/v1/cases", headers=client_headers)
    assert response.status_code == 200
    cases = response.json()["items"]
    assert len(cases) == 1
    assert cases[0]["title"] == "Assigned Case"


def test_client_cannot_access_another_clients_case_by_id(client):
    lawyer = register_user(client, email="lawyer2@example.com")
    victim_headers = register_user(client, email="victim@example.com")
    attacker_headers = register_user(client, email="attacker@example.com")
    _make_client("victim@example.com")
    _make_client("attacker@example.com")

    r = client.post(
        "/api/v1/cases",
        json={"title": "Victim's Case", "case_type": "Civil", "status": "Active", "priority": "Medium"},
        headers=lawyer,
    )
    case_id = r.json()["id"]
    victim = client.get("/api/v1/auth/me", headers=victim_headers).json()
    client.patch(f"/api/v1/cases/{case_id}", json={"client_id": victim["id"]}, headers=lawyer)

    # The attacker guesses/knows the victim's case ID and tries to fetch it directly.
    response = client.get(f"/api/v1/cases/{case_id}", headers=attacker_headers)
    assert response.status_code == 404  # not 403 -- existence isn't confirmed either


def test_client_cannot_edit_case_details(client):
    lawyer = register_user(client, email="lawyer3@example.com")
    client_headers = register_user(client, email="client3@example.com")
    _make_client("client3@example.com")

    r = client.post(
        "/api/v1/cases",
        json={"title": "Some Case", "case_type": "Civil", "status": "Active", "priority": "Medium"},
        headers=lawyer,
    )
    case_id = r.json()["id"]
    me = client.get("/api/v1/auth/me", headers=client_headers).json()
    client.patch(f"/api/v1/cases/{case_id}", json={"client_id": me["id"]}, headers=lawyer)

    response = client.patch(f"/api/v1/cases/{case_id}", json={"title": "Hacked Title"}, headers=client_headers)
    assert response.status_code == 403


def test_client_can_upload_to_their_own_case(client):
    lawyer = register_user(client, email="lawyer4@example.com")
    client_headers = register_user(client, email="client4@example.com")
    _make_client("client4@example.com")

    r = client.post(
        "/api/v1/cases",
        json={"title": "Upload Test Case", "case_type": "Civil", "status": "Active", "priority": "Medium"},
        headers=lawyer,
    )
    case_id = r.json()["id"]
    me = client.get("/api/v1/auth/me", headers=client_headers).json()
    client.patch(f"/api/v1/cases/{case_id}", json={"client_id": me["id"]}, headers=lawyer)

    response = client.post(
        "/api/v1/documents/upload",
        files={"file": ("evidence.txt", b"This is a longer piece of evidence text describing the incident in detail, including dates, names, and a full account of what happened for the purposes of this legal case file." * 3, "text/plain")},
        data={"case_id": str(case_id)},
        headers=client_headers,
    )
    assert response.status_code == 201, response.text

    # Lawyer should also see this document, since it's attached to their case.
    lawyer_docs = client.get("/api/v1/documents", headers=lawyer).json()["items"]
    assert any(d["filename"] == "evidence.txt" for d in lawyer_docs)

    # Client should see it too.
    client_docs = client.get("/api/v1/documents", headers=client_headers).json()["items"]
    assert any(d["filename"] == "evidence.txt" for d in client_docs)


def test_client_cannot_upload_to_a_case_not_theirs(client):
    lawyer = register_user(client, email="lawyer5@example.com")
    client_headers = register_user(client, email="client5@example.com")
    _make_client("client5@example.com")

    r = client.post(
        "/api/v1/cases",
        json={"title": "Not Yours", "case_type": "Civil", "status": "Active", "priority": "Medium"},
        headers=lawyer,
    )
    case_id = r.json()["id"]
    # Deliberately never assigned to the client.

    response = client.post(
        "/api/v1/documents/upload",
        files={"file": ("sneaky.txt", b"This is an attempt to sneak a document into a case that does not belong to the uploading client, which the backend must reject regardless of file content." * 3, "text/plain")},
        data={"case_id": str(case_id)},
        headers=client_headers,
    )
    assert response.status_code == 404


def test_client_can_store_media_evidence_privately_without_ai_extraction(client):
    headers = register_user(client, email="evidence-owner@example.com")
    _make_client("evidence-owner@example.com")
    other = register_user(client, email="evidence-other@example.com")
    _make_client("evidence-other@example.com")
    created = client.post("/api/v1/cases/request", json={
        "title": "Evidence case", "case_type": "Civil",
        "description": "I have an audio recording of the incident.",
    }, headers=headers)
    case_id = created.json()["id"]
    response = client.post(f"/api/v1/cases/{case_id}/evidence-files",
                           files={"file": ("recording.mp3", b"test audio payload", "audio/mpeg")}, headers=headers)
    assert response.status_code == 201, response.text
    evidence_id = response.json()["id"]
    assert client.get(f"/api/v1/cases/{case_id}/evidence-files", headers=headers).json()["items"][0]["filename"] == "recording.mp3"
    downloaded = client.get(f"/api/v1/cases/{case_id}/evidence-files/{evidence_id}/download", headers=headers)
    assert downloaded.content == b"test audio payload"
    assert client.get(f"/api/v1/cases/{case_id}/evidence-files", headers=other).status_code == 404
    assert client.get(f"/api/v1/cases/{case_id}/evidence-files/{evidence_id}/download", headers=other).status_code == 404
    assert client.post(f"/api/v1/cases/{case_id}/evidence-files",
                       files={"file": ("unsafe.exe", b"payload", "application/octet-stream")}, headers=headers).status_code == 400


def test_client_can_upload_image_and_word_documents_for_search(client):
    from io import BytesIO

    from docx import Document as WordDocument

    headers = register_user(client, email="image-docs@example.com")
    _make_client("image-docs@example.com")
    case = client.post("/api/v1/cases/request", json={
        "title": "Document case", "case_type": "Civil",
        "description": "There are images and Word documents with details of my case.",
    }, headers=headers)
    case_id = case.json()["id"]
    # Test OCR uses FAKE_OCR=1; real installations require Tesseract on PATH.
    image = client.post("/api/v1/documents/upload", data={"case_id": str(case_id)},
                        files={"file": ("scan.png", b"fake test image", "image/png")}, headers=headers)
    assert image.status_code == 201, image.text
    assert image.json()["ocr_used"] is True
    assert image.json()["ocr_review_status"] == "needs_review"
    assert image.json()["num_chunks"] == 0

    document_id = image.json()["id"]
    corrected = " ".join(["درست عدالتی دستاویز کا تصدیق شدہ متن"] * 12)
    verified = client.patch(
        f"/api/v1/documents/{document_id}",
        json={"text": corrected, "confirm_ocr": True},
        headers=headers,
    )
    assert verified.status_code == 200, verified.text
    assert verified.json()["ocr_review_status"] == "verified"
    assert verified.json()["num_chunks"] > 0
    detail = client.get(f"/api/v1/documents/{document_id}", headers=headers).json()
    assert detail["text"] == corrected

    word = WordDocument()
    word.add_paragraph("The landlord kept the deposit after the tenant returned the keys and delivered the signed receipt. " * 5)
    binary = BytesIO()
    word.save(binary)
    response = client.post("/api/v1/documents/upload", data={"case_id": str(case_id)},
                           files={"file": ("statement.docx", binary.getvalue(), "application/vnd.openxmlformats-officedocument.wordprocessingml.document")},
                           headers=headers)
    assert response.status_code == 201, response.text


def test_client_ai_question_requires_case_id(client):
    client_headers = register_user(client, email="client6@example.com")
    _make_client("client6@example.com")

    response = client.post("/api/v1/ask", json={"question": "What is my case about?"}, headers=client_headers)
    assert response.status_code == 400


def test_client_can_delete_a_case_document_and_its_chunks(client):
    headers = register_user(client, email="delete-doc@example.com")
    _make_client("delete-doc@example.com")
    case = client.post("/api/v1/cases/request", json={
        "title": "Deletion case", "case_type": "Civil",
        "description": "A case used to verify secure document deletion.",
    }, headers=headers)
    case_id = case.json()["id"]
    uploaded = client.post(
        "/api/v1/documents/upload",
        data={"case_id": str(case_id)},
        files={"file": ("remove-me.txt", b"This document contains enough searchable legal case text to create chunks before it is deliberately deleted. " * 6, "text/plain")},
        headers=headers,
    )
    assert uploaded.status_code == 201, uploaded.text
    document_id = uploaded.json()["id"]
    assert uploaded.json()["num_chunks"] > 0

    deleted = client.delete(f"/api/v1/documents/{document_id}", headers=headers)
    assert deleted.status_code == 204, deleted.text
    assert client.get(f"/api/v1/documents/{document_id}", headers=headers).status_code == 404
    remaining = client.get(f"/api/v1/cases/{case_id}/documents", headers=headers).json()
    assert all(item["id"] != document_id for item in remaining["items"])


def test_client_ai_question_cannot_use_another_clients_case(client):
    lawyer = register_user(client, email="lawyer7@example.com")
    other_client_headers = register_user(client, email="client7@example.com")
    _make_client("client7@example.com")

    r = client.post(
        "/api/v1/cases",
        json={"title": "Someone Else's Case", "case_type": "Civil", "status": "Active", "priority": "Medium"},
        headers=lawyer,
    )
    case_id = r.json()["id"]
    # Not assigned to client7.

    response = client.post(
        "/api/v1/ask",
        json={"question": "What is happening here?", "case_id": case_id},
        headers=other_client_headers,
    )
    assert response.status_code == 404


def test_client_can_request_a_new_case(client):
    client_headers = register_user(client, email="requester@example.com")
    _make_client("requester@example.com")

    response = client.post(
        "/api/v1/cases/request",
        json={
            "title": "Landlord won't return my deposit",
            "case_type": "Civil",
            "description": "My landlord has not returned my security deposit after I moved out three months ago.",
        },
        headers=client_headers,
    )
    assert response.status_code == 201, response.text
    data = response.json()
    assert data["status"] == "Review"
    assert data["lawyer_name"] is None  # unclaimed -- no lawyer assigned yet

    # It should belong to the requesting client.
    my_cases = client.get("/api/v1/cases", headers=client_headers).json()["items"]
    assert any(c["id"] == data["id"] for c in my_cases)


def test_lawyer_can_see_and_claim_an_unassigned_case_request(client):
    client_headers = register_user(client, email="requester2@example.com")
    _make_client("requester2@example.com")
    lawyer_headers = register_user(client, email="claimer@example.com")

    r = client.post(
        "/api/v1/cases/request",
        json={"title": "Need help with a contract", "case_type": "Corporate", "description": "A supplier breached our contract and I need advice."},
        headers=client_headers,
    )
    case_id = r.json()["id"]

    # Any lawyer should see it in their list before claiming it.
    lawyer_cases = client.get("/api/v1/cases", headers=lawyer_headers).json()["items"]
    assert any(c["id"] == case_id for c in lawyer_cases)

    response = client.post(f"/api/v1/cases/{case_id}/claim", headers=lawyer_headers)
    assert response.status_code == 200
    assert response.json()["lawyer_name"] is not None


def test_a_case_cannot_be_claimed_twice(client):
    client_headers = register_user(client, email="requester3@example.com")
    _make_client("requester3@example.com")
    lawyer1 = register_user(client, email="firstclaimer@example.com")
    lawyer2 = register_user(client, email="secondclaimer@example.com")

    r = client.post(
        "/api/v1/cases/request",
        json={"title": "Employment dispute", "case_type": "Labour", "description": "I was terminated without notice or severance pay."},
        headers=client_headers,
    )
    case_id = r.json()["id"]

    first = client.post(f"/api/v1/cases/{case_id}/claim", headers=lawyer1)
    assert first.status_code == 200

    second = client.post(f"/api/v1/cases/{case_id}/claim", headers=lawyer2)
    assert second.status_code == 409


def test_client_cannot_claim_a_case(client):
    client_headers = register_user(client, email="requester4@example.com")
    _make_client("requester4@example.com")

    r = client.post(
        "/api/v1/cases/request",
        json={"title": "Some issue", "case_type": "Civil", "description": "A description long enough to pass validation here."},
        headers=client_headers,
    )
    case_id = r.json()["id"]

    response = client.post(f"/api/v1/cases/{case_id}/claim", headers=client_headers)
    assert response.status_code == 403


def test_case_prediction_honestly_reports_unavailable(client):
    lawyer = register_user(client, email="lawyer8@example.com")

    r = client.post(
        "/api/v1/cases",
        json={"title": "Some Case", "case_type": "Civil", "status": "Active", "priority": "Medium"},
        headers=lawyer,
    )
    case_id = r.json()["id"]

    response = client.get(f"/api/v1/cases/{case_id}/prediction", headers=lawyer)
    assert response.status_code == 200
    data = response.json()
    assert data["available"] is False
    assert data["probability"] is None
    assert data["factors"] == []
    assert "not been generated" in data["disclaimer"].lower()


def test_case_prediction_enforces_the_same_ownership_rules(client):
    lawyer = register_user(client, email="lawyer9@example.com")
    other_client_headers = register_user(client, email="client9@example.com")
    _make_client("client9@example.com")

    r = client.post(
        "/api/v1/cases",
        json={"title": "Someone Else's Case", "case_type": "Civil", "status": "Active", "priority": "Medium"},
        headers=lawyer,
    )
    case_id = r.json()["id"]
    # Not assigned to client9.

    response = client.get(f"/api/v1/cases/{case_id}/prediction", headers=other_client_headers)
    assert response.status_code == 404


def test_client_can_access_pathway_intelligence_for_their_own_case(client):
    """Regression test: pathway_intelligence had its own local ownership
    check that only ever allowed case.owner_id == user.id, meaning a
    client could never view this for their own assigned case at all."""
    lawyer = register_user(client, email="lawyer10@example.com")
    client_headers = register_user(client, email="client10@example.com")
    _make_client("client10@example.com")

    r = client.post(
        "/api/v1/cases",
        json={"title": "Pathway Test Case", "case_type": "Civil", "status": "Active", "priority": "Medium", "description": "A dispute over unpaid wages."},
        headers=lawyer,
    )
    case_id = r.json()["id"]
    me = client.get("/api/v1/auth/me", headers=client_headers).json()
    client.patch(f"/api/v1/cases/{case_id}", json={"client_id": me["id"]}, headers=lawyer)

    response = client.get(f"/api/v1/cases/{case_id}/pathway-intelligence", headers=client_headers)
    assert response.status_code == 200
    assert response.json()["source_case"]["id"] == case_id


def test_pathway_intelligence_still_enforces_ownership_for_unrelated_clients(client):
    lawyer = register_user(client, email="lawyer11@example.com")
    other_client_headers = register_user(client, email="client11@example.com")
    _make_client("client11@example.com")

    r = client.post(
        "/api/v1/cases",
        json={"title": "Not Yours", "case_type": "Civil", "status": "Active", "priority": "Medium"},
        headers=lawyer,
    )
    case_id = r.json()["id"]
    # Not assigned to client11.

    response = client.get(f"/api/v1/cases/{case_id}/pathway-intelligence", headers=other_client_headers)
    assert response.status_code == 404


def test_client_ai_question_on_unclaimed_own_case_does_not_500(client):
    """Integration-level smoke test: a client can ask the AI Assistant
    about their own case before any lawyer has claimed it, and gets a
    real 200 response end-to-end through the full /ask flow. Note this
    test runs with FAKE_EMBEDDINGS=1 (set for all tests in conftest.py),
    which does not exercise the exact code path where the original bug
    lived (vector_index.search() only raises on owner_id=None in the
    real, non-fake branch) -- see
    test_resolve_search_scope_never_includes_none_for_an_unclaimed_case
    below for a test that actually pins down the root-cause logic."""
    client_headers = register_user(client, email="unclaimedasker@example.com")
    _make_client("unclaimedasker@example.com")

    r = client.post(
        "/api/v1/cases/request",
        json={
            "title": "My unclaimed case",
            "case_type": "Civil",
            "description": "A dispute that no lawyer has picked up yet.",
        },
        headers=client_headers,
    )
    case_id = r.json()["id"]
    assert r.json()["lawyer_name"] is None  # confirms it's genuinely unclaimed

    response = client.post(
        "/api/v1/ask",
        json={"question": "What is my case about?", "case_id": case_id},
        headers=client_headers,
    )
    assert response.status_code == 200, response.text
    assert response.json()["answer"]


def test_client_ai_question_uses_selected_case_description_without_documents(client):
    client_headers = register_user(client, email="casecontext@example.com")
    _make_client("casecontext@example.com")

    created = client.post(
        "/api/v1/cases/request",
        json={
            "title": "Tenancy deposit dispute",
            "case_type": "Civil",
            "description": (
                "The landlord retained the security deposit after the tenant returned "
                "the keys and provided photographs showing no property damage."
            ),
        },
        headers=client_headers,
    )
    case_id = created.json()["id"]

    response = client.post(
        "/api/v1/ask",
        json={"question": "What happens next in my case?", "case_id": case_id},
        headers=client_headers,
    )

    assert response.status_code == 200, response.text
    body = response.json()
    assert "Not enough information" not in body["answer"]
    assert "security deposit" in body["answer"].lower()
    assert "useful next steps" in body["answer"].lower()
    assert "bank statements" in body["answer"].lower()
    assert body["confidence"]["level"] == "low"
    assert "case" in body["confidence"]["reason"].lower()
    assert body["model"] == "case-guidance"


def test_client_can_edit_description_and_manage_dated_updates(client):
    headers = register_user(client, email="journal@example.com")
    _make_client("journal@example.com")
    created = client.post("/api/v1/cases/request", json={
        "title": "Deposit dispute", "case_type": "Civil",
        "description": "The landlord has kept my security deposit after I returned the property.",
    }, headers=headers)
    case_id = created.json()["id"]
    changed = client.patch(f"/api/v1/cases/{case_id}", json={"description": "I returned the keys and have a receipt."}, headers=headers)
    assert changed.status_code == 200, changed.text
    assert changed.json()["description"] == "I returned the keys and have a receipt."
    assert client.patch(f"/api/v1/cases/{case_id}", json={"status": "Closed"}, headers=headers).status_code == 403

    other_headers = register_user(client, email="journal-other@example.com")
    _make_client("journal-other@example.com")
    another = client.post("/api/v1/cases/request", json={
        "title": "Other dispute", "case_type": "Civil",
        "description": "The respondent did not return the signed agreement.",
    }, headers=other_headers)
    other_case_id = another.json()["id"]
    uploaded = client.post(
        "/api/v1/documents/upload",
        files={"file": ("receipt.txt", b"I returned the keys and kept a dated signed receipt for the tenancy deposit. " * 8, "text/plain")},
        data={"case_id": str(case_id)}, headers=headers,
    )
    assert uploaded.status_code == 201, uploaded.text
    document_id = uploaded.json()["id"]
    response = client.post(f"/api/v1/cases/{case_id}/events", json={
        "date": "2026-09-20", "text": "I returned the keys and saved a receipt.", "document_id": document_id,
    }, headers=headers)
    assert response.status_code == 201, response.text
    event_id = response.json()["id"]
    assert client.post(f"/api/v1/cases/{other_case_id}/events", json={
        "date": "2026-09-20", "text": "Unauthorized update",
    }, headers=headers).status_code == 404
    timeline = client.get(f"/api/v1/cases/{case_id}/timeline", headers=headers)
    assert timeline.status_code == 200
    assert any(row["event_id"] == event_id and row["text"].startswith("I returned") for row in timeline.json()["events"])
    assert any(row["event_id"] == event_id and row["document_id"] == document_id for row in timeline.json()["events"])
    assert client.post(f"/api/v1/cases/{other_case_id}/events", json={
        "date": "2026-09-21", "text": "Wrong document", "document_id": document_id,
    }, headers=other_headers).status_code == 422
    updated = client.put(f"/api/v1/cases/{case_id}/events/{event_id}", json={
        "date": "2026-09-21", "text": "I found the signed receipt.", "document_id": None,
    }, headers=headers)
    assert updated.status_code == 200, updated.text
    assert client.put(f"/api/v1/cases/{case_id}/events/{event_id}", json={
        "date": "2026-09-21", "text": "Someone else's update",
    }, headers=other_headers).status_code == 404


def test_client_ai_followup_uses_history_for_retrieval_and_guidance(client, monkeypatch):
    import app.routers.qa as qa_module

    headers = register_user(client, email="followup@example.com")
    _make_client("followup@example.com")
    created = client.post(
        "/api/v1/cases/request",
        json={"title": "Deposit", "case_type": "Civil", "description": "A disputed security deposit."},
        headers=headers,
    )
    assert created.status_code == 201, created.text
    searched = []

    def capture_search(question, *args, **kwargs):
        searched.append(question)
        return []

    monkeypatch.setattr(qa_module.vector_index, "search", capture_search)
    response = client.post(
        "/api/v1/ask",
        json={
            "question": "What about that?",
            "case_id": created.json()["id"],
            "history": [{"role": "user", "content": "The landlord kept my security deposit."}],
        },
        headers=headers,
    )
    assert response.status_code == 200, response.text
    assert searched and "landlord kept my security deposit" in searched[0]
    assert "landlord kept my security deposit" in response.json()["answer"]
    assert response.json()["confidence"]["level"] == "low"


def test_resolve_search_scope_never_includes_none_for_an_unclaimed_case():
    """More targeted unit test for the actual broken logic, since the API
    test above runs with FAKE_EMBEDDINGS=1 (set in conftest.py for all
    tests) and can't reach the real Qdrant code path where the original
    bug actually lived -- vector_index.search() raises ValueError when
    passed owner_id=None, which only the real (non-fake) branch checks.
    This directly tests _resolve_search_scope's return value instead,
    confirming it can never hand back a set containing None regardless of
    whether the case has been claimed."""
    from unittest.mock import MagicMock

    from app.routers.qa import _resolve_search_scope

    fake_case = MagicMock(owner_id=None)
    fake_user = MagicMock(role="client", id=42)
    fake_db = MagicMock()
    fake_db.scalars.return_value.all.return_value = [1, 2, 3]

    import app.routers.cases as cases_module
    original = cases_module._get_owned_case
    cases_module._get_owned_case = lambda db, case_id, user: fake_case
    try:
        owner_ids, document_ids = _resolve_search_scope(fake_db, fake_user, case_id=7)
    finally:
        cases_module._get_owned_case = original

    assert None not in owner_ids
    assert owner_ids == {42}  # only the client's own id -- no lawyer to search under yet
    assert document_ids == {1, 2, 3}


def test_ask_never_returns_a_raw_500_on_an_unexpected_failure(client, monkeypatch):
    """Directly verifies the safety net added around /ask: any exception
    that isn't a deliberate HTTPException (a real infrastructure failure --
    the embedding model down, Qdrant unreachable, anything unpredictable)
    must come back as a clean 503 with a real message, never an opaque
    raw 500. Forces a genuine unexpected exception via monkeypatch rather
    than trying to actually break the real AI pipeline."""
    import app.routers.qa as qa_module

    lawyer_headers = register_user(client, email="safetynet@example.com")

    def _boom(*args, **kwargs):
        raise RuntimeError("simulated embedding model failure")

    monkeypatch.setattr(qa_module.vector_index, "search", _boom)

    response = client.post(
        "/api/v1/ask",
        json={"question": "What does this document say about the contract terms?"},
        headers=lawyer_headers,
    )
    assert response.status_code == 503
    assert "temporarily unavailable" in response.json()["detail"].lower()
    # Never leaks the raw exception text to the client.
    assert "simulated embedding model failure" not in response.text
