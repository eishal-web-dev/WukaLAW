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


def test_registration_cannot_grant_admin_and_role_survives_login(client):
    response = client.post('/api/v1/auth/register', json={
        'email': 'role@example.com', 'name': 'Role Test', 'password': 'secret123', 'role': 'admin',
    })
    assert response.status_code == 201, response.text
    assert response.json()['user']['role'] == 'lawyer'
    headers = {'Authorization': f"Bearer {response.json()['token']}"}
    for path in ('/api/v1/admin/stats', '/api/v1/admin/users'):
        assert client.get(path, headers=headers).status_code == 403
        assert client.get(path).status_code == 401
    assert client.get('/api/v1/auth/me', headers=headers).json()['role'] == 'lawyer'

    _make_admin('role@example.com')
    assert client.get('/api/v1/auth/me', headers=headers).json()['role'] == 'admin'
    login = client.post('/api/v1/auth/login', json={'email': 'role@example.com', 'password': 'secret123'})
    assert login.status_code == 200, login.text
    assert login.json()['user']['role'] == 'admin'

    from sqlalchemy import text
    from app.db import engine
    with engine.begin() as connection:
        connection.execute(text("UPDATE users SET role = 'lawyer' WHERE email = 'role@example.com'"))
    assert client.get('/api/v1/admin/users', headers=headers).status_code == 403
