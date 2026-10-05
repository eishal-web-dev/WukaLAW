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
    headers = register_user(client, email="admin@gmail.com")
    _make_admin("admin@gmail.com")

    response = client.get("/api/v1/admin/stats", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total_users"] == 1
    assert data["total_cases"] == 0
    assert data["total_documents"] == 0


def test_admin_can_list_users_with_real_counts(client):
    admin_headers = register_user(client, email="admin@gmail.com")
    _make_admin("admin@gmail.com")
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

    boss = next(u for u in users if u["email"] == "admin@gmail.com")
    assert boss["role"] == "admin"
    assert boss["case_count"] == 1

    employee = next(u for u in users if u["email"] == "employee@example.com")
    assert employee["role"] == "lawyer"
    assert employee["case_count"] == 0


def test_unauthenticated_request_is_rejected(client):
    response = client.get("/api/v1/admin/stats")
    assert response.status_code == 401


def test_admin_operations_use_real_data_and_protect_roles(client):
    admin_headers = register_user(client, email="admin@gmail.com")
    _make_admin("admin@gmail.com")
    lawyer_headers = register_user(client, email="lawyer@example.com", name="Adv. Test")

    case = client.post(
        "/api/v1/cases",
        json={"title": "Live family case", "case_type": "Family"},
        headers=lawyer_headers,
    )
    assert case.status_code == 201, case.text

    cases = client.get("/api/v1/admin/cases", headers=admin_headers)
    assert cases.status_code == 200
    assert cases.json()[0]["lawyer_name"] == "Adv. Test"

    activity = client.get("/api/v1/admin/activity", headers=admin_headers)
    assert activity.status_code == 200
    assert any(item["kind"] == "case" for item in activity.json())

    system = client.get("/api/v1/admin/system", headers=admin_headers)
    assert system.status_code == 200
    assert system.json()["api_status"] == "healthy"
    assert "database_backend" in system.json()
    assert "billing_configured" in system.json()

    lawyer = next(u for u in client.get("/api/v1/admin/users", headers=admin_headers).json() if u["email"] == "lawyer@example.com")
    changed = client.patch(
        f"/api/v1/admin/users/{lawyer['id']}/role",
        json={"role": "client"}, headers=admin_headers,
    )
    assert changed.status_code == 200
    assert changed.json()["role"] == "client"

    admin = next(u for u in client.get("/api/v1/admin/users", headers=admin_headers).json() if u["email"] == "admin@gmail.com")
    assert client.patch(
        f"/api/v1/admin/users/{admin['id']}/role",
        json={"role": "client"}, headers=admin_headers,
    ).status_code == 422


def test_admin_operations_remain_admin_only(client):
    headers = register_user(client, email="ordinary@example.com")
    for path in ("cases", "documents", "activity", "system"):
        assert client.get(f"/api/v1/admin/{path}", headers=headers).status_code == 403


def test_admin_business_records_are_persisted_and_editable(client):
    headers = register_user(client, email="admin@gmail.com")
    _make_admin("admin@gmail.com")
    plan = client.post("/api/v1/admin/billing-plans", headers=headers, json={"name":"Chambers","monthly_price":12000,"currency":"PKR","features":["10 cases"],"active":True})
    assert plan.status_code == 201, plan.text
    assert client.get("/api/v1/admin/billing-plans", headers=headers).json()[0]["name"] == "Chambers"
    ticket = client.post("/api/v1/admin/support-tickets", headers=headers, json={"requester_email":"client@example.com","subject":"Upload help","description":"Image upload failed","priority":"High","status":"Open"})
    assert ticket.status_code == 201, ticket.text
    updated = client.put(f"/api/v1/admin/support-tickets/{ticket.json()['id']}", headers=headers, json={**ticket.json(),"status":"Resolved"})
    assert updated.status_code == 200 and updated.json()["status"] == "Resolved"
    post = client.post("/api/v1/admin/cms-posts", headers=headers, json={"title":"Family court guide","slug":"family-court-guide","excerpt":"A guide","body":"Full verified content","status":"Draft"})
    assert post.status_code == 201, post.text
    assert client.get("/api/v1/admin/cms-posts", headers=headers).json()[0]["slug"] == "family-court-guide"


def test_registration_cannot_grant_admin_and_role_survives_login(client):
    response = client.post('/api/v1/auth/register', json={
        'email': 'role@example.com', 'name': 'Role Test', 'password': 'secret123', 'role': 'admin',
    })
    assert response.status_code == 422, response.text
    response = client.post('/api/v1/auth/register', json={
        'email': 'role@example.com', 'name': 'Role Test', 'password': 'secret123', 'role': 'lawyer',
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
    assert login.status_code == 403, login.text

    from sqlalchemy import text
    from app.db import engine
    with engine.begin() as connection:
        connection.execute(text("UPDATE users SET role = 'lawyer' WHERE email = 'role@example.com'"))
    assert client.get('/api/v1/admin/users', headers=headers).status_code == 403
