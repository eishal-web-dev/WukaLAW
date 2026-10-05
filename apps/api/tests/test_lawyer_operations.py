from tests.conftest import register_user


def _client_headers(client, email="operations-client@example.com"):
    response = client.post(
        "/api/v1/auth/register",
        json={"email": email, "name": "Operations Client", "password": "secret123", "role": "client"},
    )
    return {"Authorization": f"Bearer {response.json()['token']}"}


def _claimed_case(client, lawyer, client_headers):
    requested = client.post(
        "/api/v1/cases/request",
        json={"title": "Live family matter", "case_type": "Family", "description": "Real client instructions."},
        headers=client_headers,
    )
    case_id = requested.json()["id"]
    claimed = client.post(f"/api/v1/cases/{case_id}/claim", headers=lawyer)
    assert claimed.status_code == 200, claimed.text
    return claimed.json()


def test_strategy_is_saved_per_owned_case_and_isolated(client):
    lawyer = register_user(client, email="strategy-lawyer@example.com")
    other = register_user(client, email="other-strategy-lawyer@example.com")
    client_headers = _client_headers(client)
    case = _claimed_case(client, lawyer, client_headers)

    saved = client.put(
        f"/api/v1/lawyer-operations/cases/{case['id']}/strategy",
        json={
            "objective": "Protect interim custody.", "case_theory": "Continuity of care supports the client.",
            "strengths": ["School records"], "risks": ["Missing latest order"],
            "next_actions": ["Obtain certified order"],
        }, headers=lawyer,
    )
    assert saved.status_code == 200, saved.text
    assert saved.json()["case_number"] == case["case_number"]
    assert client.get(f"/api/v1/lawyer-operations/cases/{case['id']}/strategy", headers=lawyer).json()["strengths"] == ["School records"]
    assert client.get(f"/api/v1/lawyer-operations/cases/{case['id']}/strategy", headers=other).status_code == 404


def test_case_messages_are_shared_only_between_assigned_lawyer_and_client(client):
    lawyer = register_user(client, email="messages-lawyer@example.com")
    outsider = register_user(client, email="messages-outsider@example.com")
    client_headers = _client_headers(client, "messages-client@example.com")
    case = _claimed_case(client, lawyer, client_headers)

    sent = client.post(
        "/api/v1/lawyer-operations/messages",
        json={"case_id": case["id"], "body": "Please bring the certified order."}, headers=lawyer,
    )
    assert sent.status_code == 201, sent.text
    assert client.get(f"/api/v1/lawyer-operations/messages?case_id={case['id']}", headers=client_headers).json()[0]["body"].startswith("Please bring")
    assert client.get(f"/api/v1/lawyer-operations/messages?case_id={case['id']}", headers=outsider).status_code == 404


def test_team_directory_and_billing_profile_are_real_and_private(client, monkeypatch):
    lawyer = register_user(client, email="office-lawyer@example.com")
    other = register_user(client, email="other-office@example.com")

    member = client.post(
        "/api/v1/lawyer-operations/team",
        json={"name": "Ayesha Khan", "email": "ayesha@example.com", "role": "Paralegal", "notes": "Family files"},
        headers=lawyer,
    )
    assert member.status_code == 201, member.text
    assert len(client.get("/api/v1/lawyer-operations/team", headers=lawyer).json()) == 1
    assert client.get("/api/v1/lawyer-operations/team", headers=other).json() == []

    monkeypatch.setattr("app.routers.lawyer_operations.send_email", lambda **kwargs: "provider-email-1")
    delivered = client.post(
        f"/api/v1/lawyer-operations/team/{member.json()['id']}/email",
        json={"subject": "Hearing update", "body": "Please prepare the file."},
        headers=lawyer,
    )
    assert delivered.status_code == 200, delivered.text
    assert delivered.json() == {"delivered": True, "recipient": "ayesha@example.com", "provider_message_id": "provider-email-1"}
    assert client.post(
        f"/api/v1/lawyer-operations/team/{member.json()['id']}/email",
        json={"subject": "No access", "body": "Should fail"}, headers=other,
    ).status_code == 404

    billing = client.put(
        "/api/v1/lawyer-operations/billing",
        json={"business_name": "Khan Law", "currency": "PKR", "hourly_rate": 12000, "invoice_notes": "Due in 7 days"},
        headers=lawyer,
    )
    assert billing.status_code == 200, billing.text
    assert billing.json()["hourly_rate"] == 12000
    assert billing.json()["payment_status"] == "No payment provider configured"
    assert client.get("/api/v1/lawyer-operations/billing", headers=other).json()["business_name"] == ""
