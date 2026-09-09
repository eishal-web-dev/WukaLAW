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


def test_client_ai_question_requires_case_id(client):
    client_headers = register_user(client, email="client6@example.com")
    _make_client("client6@example.com")

    response = client.post("/api/v1/ask", json={"question": "What is my case about?"}, headers=client_headers)
    assert response.status_code == 400


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
