import io

from tests.conftest import SAMPLE_JUDGMENT, register_user


def _create_case(client, headers, **overrides):
    payload = {"title": "State v. Aslam", "case_type": "Criminal", **overrides}
    return client.post("/api/v1/cases", json=payload, headers=headers)


def test_case_crud_flow(client):
    headers = register_user(client)

    created = _create_case(client, headers, priority="High")
    assert created.status_code == 201
    case = created.json()
    assert case["case_number"].startswith("WL-")
    assert case["status"] == "Active"
    assert case["priority"] == "High"

    listing = client.get("/api/v1/cases", headers=headers).json()
    assert listing["total"] == 1

    updated = client.patch(
        f"/api/v1/cases/{case['id']}", json={"status": "Closed"}, headers=headers
    ).json()
    assert updated["status"] == "Closed"

    assert client.delete(f"/api/v1/cases/{case['id']}", headers=headers).status_code == 204
    assert client.get("/api/v1/cases", headers=headers).json()["total"] == 0


def test_case_rejects_bad_status(client):
    headers = register_user(client)
    response = _create_case(client, headers, status="Bogus")
    assert response.status_code == 422


def test_case_accepts_user_friendly_lifecycle_stages(client):
    headers = register_user(client, email="stages@example.com")
    created = _create_case(client, headers, status="Started")
    assert created.status_code == 201, created.text
    case_id = created.json()["id"]

    for stage in ("Currently Going On", "Case Complete"):
        response = client.patch(
            f"/api/v1/cases/{case_id}", json={"status": stage}, headers=headers
        )
        assert response.status_code == 200, response.text
        assert response.json()["status"] == stage


def test_case_isolation_between_users(client):
    headers_a = register_user(client, email="a@case.com")
    headers_b = register_user(client, email="b@case.com")
    case_id = _create_case(client, headers_a).json()["id"]
    assert client.get(f"/api/v1/cases/{case_id}", headers=headers_b).status_code == 404


def test_upload_into_case_and_list_case_documents(client):
    headers = register_user(client)
    case_id = _create_case(client, headers).json()["id"]

    upload = client.post(
        "/api/v1/documents/upload",
        files={"file": ("case_doc.txt", io.BytesIO(SAMPLE_JUDGMENT.encode()), "text/plain")},
        data={"case_id": str(case_id)},
        headers=headers,
    )
    assert upload.status_code == 201, upload.text

    docs = client.get(f"/api/v1/cases/{case_id}/documents", headers=headers).json()
    assert docs["total"] == 1
    assert client.get("/api/v1/cases", headers=headers).json()["items"][0]["num_documents"] == 1


def test_attach_existing_document_to_case(client):
    headers = register_user(client)
    case_id = _create_case(client, headers).json()["id"]
    doc = client.post(
        "/api/v1/documents/upload",
        files={"file": ("loose.txt", io.BytesIO(SAMPLE_JUDGMENT.encode()), "text/plain")},
        headers=headers,
    ).json()
    patched = client.patch(
        f"/api/v1/documents/{doc['id']}", json={"case_id": case_id}, headers=headers
    )
    assert patched.status_code == 200
    docs = client.get(f"/api/v1/cases/{case_id}/documents", headers=headers).json()
    assert docs["total"] == 1
