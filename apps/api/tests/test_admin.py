from tests.conftest import register_user


def _make_admin(email: str) -> None:
    """Directly promotes a user to admin, mirroring the documented
    production procedure (there is no API endpoint for this by design)."""
    from sqlalchemy import text

    from app.db import engine

    with engine.connect() as connection:
        connection.execute(text("UPDATE users SET role = 'admin' WHERE email = :email"), {"email": email})
        connection.commit()


def test_non_admin_gets_403(client):
    headers = register_user(client, email="regular@example.com")
    response = client.get("/api/v1/admin/stats", headers=headers)
    assert response.status_code == 403


def test_admin_can_see_stats(client):
    headers = register_user(client, email="boss@example.com")
    _make_admin("boss@example.com")

    response = client.get("/api/v1/admin/stats", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total_users"] == 1
    assert data["total_cases"] == 0
    assert data["total_documents"] == 0


def test_admin_can_list_users_with_real_counts(client):
    admin_headers = register_user(client, email="boss2@example.com")
    _make_admin("boss2@example.com")
    register_user(client, email="employee@example.com")

    response = client.post(
        "/api/v1/cases",
        json={"title": "Test Case", "case_type": "Civil", "status": "Active", "priority": "Medium"},
        headers=admin_headers,
    )
    assert response.status_code == 201, response.text

    response = client.get("/api/v1/admin/users", headers=admin_headers)
    assert response.status_code == 200
    users = response.json()
    assert len(users) == 2

    boss = next(u for u in users if u["email"] == "boss2@example.com")
    assert boss["role"] == "admin"
    assert boss["case_count"] == 1

    employee = next(u for u in users if u["email"] == "employee@example.com")
    assert employee["role"] == "lawyer"
    assert employee["case_count"] == 0


def test_unauthenticated_request_is_rejected(client):
    response = client.get("/api/v1/admin/stats")
    assert response.status_code == 401
