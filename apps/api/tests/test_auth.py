from tests.conftest import register_user


def test_register_login_me_flow(client):
    headers = register_user(client, email="a@b.com", name="Aisha", password="password1")

    me = client.get("/api/v1/auth/me", headers=headers)
    assert me.status_code == 200
    assert me.json()["email"] == "a@b.com"

    login = client.post("/api/v1/auth/login", json={"email": "a@b.com", "password": "password1"})
    assert login.status_code == 200
    assert login.json()["user"]["name"] == "Aisha"


def test_register_duplicate_email_rejected(client):
    register_user(client, email="dup@x.com")
    response = client.post(
        "/api/v1/auth/register",
        json={"email": "dup@x.com", "name": "Other", "password": "password1"},
    )
    assert response.status_code == 409


def test_login_wrong_password(client):
    register_user(client, email="c@d.com", password="rightpass1")
    response = client.post("/api/v1/auth/login", json={"email": "c@d.com", "password": "wrongpass"})
    assert response.status_code == 401


def test_protected_endpoints_require_token(client):
    assert client.get("/api/v1/documents").status_code == 401
    assert client.post("/api/v1/ask", json={"question": "anything?"}).status_code == 401
    assert client.post("/api/v1/similar-cases", json={"query": "anything"}).status_code == 401
    assert client.get("/api/v1/documents", headers={"Authorization": "Bearer garbage"}).status_code == 401


def test_users_cannot_see_each_others_documents(client):
    import io

    from tests.conftest import SAMPLE_JUDGMENT

    headers_a = register_user(client, email="owner@x.com")
    headers_b = register_user(client, email="intruder@x.com")

    upload = client.post(
        "/api/v1/documents/upload",
        files={"file": ("case.txt", io.BytesIO(SAMPLE_JUDGMENT.encode()), "text/plain")},
        headers=headers_a,
    )
    document_id = upload.json()["id"]

    assert client.get("/api/v1/documents", headers=headers_b).json()["total"] == 0
    assert client.get(f"/api/v1/documents/{document_id}", headers=headers_b).status_code == 404

    search = client.post(
        "/api/v1/similar-cases", json={"query": "eyewitness testimony"}, headers=headers_b
    )
    assert search.json()["results"] == []
