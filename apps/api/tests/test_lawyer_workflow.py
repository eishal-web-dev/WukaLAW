from tests.conftest import register_user


def _case(client, headers, title="Family matter"):
    response = client.post(
        "/api/v1/cases",
        json={"title": title, "case_type": "Family", "description": "A real case workspace."},
        headers=headers,
    )
    assert response.status_code == 201, response.text
    return response.json()


def test_lawyer_organizer_crud_and_case_labels(client):
    headers = register_user(client)
    case = _case(client, headers)

    event = client.post(
        "/api/v1/lawyer-workflow/events",
        json={
            "case_id": case["id"], "title": "Client conference",
            "starts_at": "2026-10-05T10:00:00Z", "event_type": "Meeting",
            "location": "Office", "notes": "Prepare chronology.",
        }, headers=headers,
    )
    assert event.status_code == 201, event.text
    assert event.json()["case_number"] == case["case_number"]

    task = client.post(
        "/api/v1/lawyer-workflow/tasks",
        json={"case_id": case["id"], "title": "Draft written statement", "priority": "High"},
        headers=headers,
    )
    assert task.status_code == 201, task.text
    moved = client.patch(
        f"/api/v1/lawyer-workflow/tasks/{task.json()['id']}",
        json={"status": "In Progress"}, headers=headers,
    )
    assert moved.json()["status"] == "In Progress"

    hearing = client.post(
        "/api/v1/lawyer-workflow/hearings",
        json={
            "case_id": case["id"], "title": "Evidence hearing",
            "scheduled_at": "2026-10-10T09:30:00Z", "court": "Family Court, Nowshera",
            "preparation_notes": "Bring original Nikahnama and witness list.",
        }, headers=headers,
    )
    assert hearing.status_code == 201, hearing.text
    assert hearing.json()["case_title"] == case["title"]

    research = client.post(
        "/api/v1/lawyer-workflow/research",
        json={"case_id": case["id"], "query": "Recovery of unpaid dower", "notes": "Saved answer", "results": [{"title": "Authority"}]},
        headers=headers,
    )
    assert research.status_code == 201, research.text
    assert len(client.get("/api/v1/lawyer-workflow/research", headers=headers).json()) == 1

    assert client.delete(f"/api/v1/lawyer-workflow/events/{event.json()['id']}", headers=headers).status_code == 204
    assert client.delete(f"/api/v1/lawyer-workflow/hearings/{hearing.json()['id']}", headers=headers).status_code == 204


def test_lawyer_workflow_isolation_and_client_denial(client):
    lawyer_a = register_user(client, email="lawyer-a@example.com")
    lawyer_b = register_user(client, email="lawyer-b@example.com")
    case = _case(client, lawyer_a)
    task = client.post(
        "/api/v1/lawyer-workflow/tasks",
        json={"case_id": case["id"], "title": "Private task"}, headers=lawyer_a,
    ).json()

    assert client.get("/api/v1/lawyer-workflow/tasks", headers=lawyer_b).json() == []
    assert client.patch(
        f"/api/v1/lawyer-workflow/tasks/{task['id']}", json={"status": "Done"}, headers=lawyer_b,
    ).status_code == 404

    client_register = client.post(
        "/api/v1/auth/register",
        json={"email": "client@example.com", "name": "Client", "password": "secret123", "role": "client"},
    )
    client_headers = {"Authorization": f"Bearer {client_register.json()['token']}"}
    assert client.get("/api/v1/lawyer-workflow/tasks", headers=client_headers).status_code == 403


def test_event_rejects_end_before_start(client):
    headers = register_user(client)
    response = client.post(
        "/api/v1/lawyer-workflow/events",
        json={"title": "Impossible meeting", "starts_at": "2026-10-05T10:00:00Z", "ends_at": "2026-10-05T09:00:00Z"},
        headers=headers,
    )
    assert response.status_code == 422


def test_lawyer_clients_are_real_assigned_clients_only(client):
    lawyer = register_user(client, email="assigned-lawyer@example.com")
    client_registration = client.post(
        "/api/v1/auth/register",
        json={"email": "real-client@example.com", "name": "Real Client", "password": "secret123", "role": "client"},
    )
    client_headers = {"Authorization": f"Bearer {client_registration.json()['token']}"}
    requested = client.post(
        "/api/v1/cases/request",
        json={"title": "Assigned family matter", "case_type": "Family", "description": "A real requested matter."},
        headers=client_headers,
    )
    case_id = requested.json()["id"]

    # An intake request is not yet part of any lawyer's client book.
    assert client.get("/api/v1/lawyer-workflow/clients", headers=lawyer).json() == []
    assert client.post(f"/api/v1/cases/{case_id}/claim", headers=lawyer).status_code == 200

    response = client.get("/api/v1/lawyer-workflow/clients", headers=lawyer)
    assert response.status_code == 200, response.text
    assert response.json() == [{
        "id": response.json()[0]["id"],
        "name": "Real Client",
        "email": "real-client@example.com",
        "case_count": 1,
        "active_case_count": 1,
        "document_count": 0,
        "last_case_at": response.json()[0]["last_case_at"],
        "cases": [response.json()[0]["cases"][0]],
    }]
    assert response.json()[0]["cases"][0]["id"] == case_id
