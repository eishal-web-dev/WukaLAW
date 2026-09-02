import io

from tests.conftest import SAMPLE_JUDGMENT, register_user


def test_notification_lifecycle_and_real_case_event(client):
    headers = register_user(client)

    initial = client.get("/api/v1/notifications", headers=headers)
    assert initial.status_code == 200
    assert initial.json()["total"] == 1
    assert initial.json()["unread"] == 1
    assert initial.json()["items"][0]["title"] == "Welcome to WukaLAW"

    created_case = client.post(
        "/api/v1/cases",
        json={"title": "State v. Aslam", "case_type": "Criminal"},
        headers=headers,
    )
    assert created_case.status_code == 201

    listing = client.get("/api/v1/notifications", headers=headers).json()
    assert listing["total"] == 2
    assert listing["unread"] == 2
    case_notification = listing["items"][0]
    assert case_notification["type"] == "case"
    assert case_notification["title"] == "Case created"
    assert case_notification["action_url"] == f"/cases/{created_case.json()['id']}"

    marked = client.patch(
        f"/api/v1/notifications/{case_notification['id']}/read", headers=headers
    )
    assert marked.status_code == 200
    assert marked.json()["read"] is True
    assert client.get("/api/v1/notifications/unread-count", headers=headers).json() == {"unread": 1}

    assert client.post("/api/v1/notifications/read-all", headers=headers).json() == {"unread": 0}
    assert client.get("/api/v1/notifications", headers=headers).json()["unread"] == 0

    deleted = client.delete(
        f"/api/v1/notifications/{case_notification['id']}", headers=headers
    )
    assert deleted.status_code == 204
    assert client.get("/api/v1/notifications", headers=headers).json()["total"] == 1


def test_notification_filters_and_user_isolation(client):
    headers_a = register_user(client, email="a@notifications.com")
    headers_b = register_user(client, email="b@notifications.com")

    created_case = client.post(
        "/api/v1/cases",
        json={"title": "Private Case", "case_type": "Civil"},
        headers=headers_a,
    )
    assert created_case.status_code == 201

    case_items = client.get("/api/v1/notifications?type=case", headers=headers_a).json()
    assert case_items["total"] == 1
    notification_id = case_items["items"][0]["id"]

    assert client.get("/api/v1/notifications?type=case", headers=headers_b).json()["total"] == 0
    assert client.patch(
        f"/api/v1/notifications/{notification_id}/read", headers=headers_b
    ).status_code == 404
    assert client.delete(
        f"/api/v1/notifications/{notification_id}", headers=headers_b
    ).status_code == 404


def test_disabling_in_app_notifications_is_persisted_and_respected(client):
    headers = register_user(client)

    disabled = client.patch(
        "/api/v1/notifications/preferences",
        json={"in_app_enabled": False},
        headers=headers,
    )
    assert disabled.status_code == 200
    assert disabled.json() == {"in_app_enabled": False}
    assert client.get("/api/v1/notifications/preferences", headers=headers).json() == {
        "in_app_enabled": False
    }

    response = client.post(
        "/api/v1/cases",
        json={"title": "Silent Case", "case_type": "Civil"},
        headers=headers,
    )
    assert response.status_code == 201
    notifications = client.get("/api/v1/notifications", headers=headers).json()
    assert notifications["total"] == 1  # only the welcome notification from registration


def test_document_and_ai_actions_create_actionable_notifications(client):
    headers = register_user(client)
    upload = client.post(
        "/api/v1/documents/upload",
        files={"file": ("judgment.txt", io.BytesIO(SAMPLE_JUDGMENT.encode()), "text/plain")},
        headers=headers,
    )
    assert upload.status_code == 201
    document_id = upload.json()["id"]

    summary = client.post(f"/api/v1/documents/{document_id}/summarize", headers=headers)
    assert summary.status_code == 200

    notifications = client.get("/api/v1/notifications", headers=headers).json()["items"]
    assert notifications[0]["type"] == "ai"
    assert notifications[0]["title"] == "AI summary ready"
    assert notifications[0]["action_url"] == f"/documents/{document_id}"
    assert any(item["title"] == "Document ready" for item in notifications)
