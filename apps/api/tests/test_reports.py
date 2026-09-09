from tests.conftest import register_user


def test_client_can_generate_a_real_report_for_their_case(client):
    lawyer = register_user(client, email="reportlawyer1@example.com")
    client_headers = register_user(client, email="reportclient1@example.com")
    from sqlalchemy import text
    from app.db import engine

    with engine.connect() as connection:
        connection.execute(text("UPDATE users SET role = 'client' WHERE email = 'reportclient1@example.com'"))
        connection.commit()

    r = client.post(
        "/api/v1/cases",
        json={"title": "Report Test Case", "case_type": "Civil", "status": "Active", "priority": "Medium", "description": "A real dispute over a contract."},
        headers=lawyer,
    )
    case_id = r.json()["id"]
    me = client.get("/api/v1/auth/me", headers=client_headers).json()
    client.patch(f"/api/v1/cases/{case_id}", json={"client_id": me["id"]}, headers=lawyer)

    response = client.post(f"/api/v1/cases/{case_id}/reports", json={"report_type": "case_summary"}, headers=client_headers)
    assert response.status_code == 201, response.text
    data = response.json()
    assert "Report Test Case" in data["content"]
    assert "A real dispute over a contract." in data["content"]
    assert data["case_number"] == r.json()["case_number"]


def test_generated_reports_are_listed_and_persisted(client):
    lawyer = register_user(client, email="reportlawyer2@example.com")

    r = client.post(
        "/api/v1/cases",
        json={"title": "Persisted Case", "case_type": "Civil", "status": "Active", "priority": "Medium"},
        headers=lawyer,
    )
    case_id = r.json()["id"]

    client.post(f"/api/v1/cases/{case_id}/reports", json={"report_type": "case_summary"}, headers=lawyer)
    client.post(f"/api/v1/cases/{case_id}/reports", json={"report_type": "case_summary"}, headers=lawyer)

    response = client.get(f"/api/v1/cases/{case_id}/reports", headers=lawyer)
    assert response.status_code == 200
    assert len(response.json()) == 2

    all_reports = client.get("/api/v1/reports", headers=lawyer)
    assert all_reports.status_code == 200
    assert len(all_reports.json()) >= 2


def test_report_download_enforces_ownership(client):
    lawyer = register_user(client, email="reportlawyer3@example.com")
    other_lawyer = register_user(client, email="reportlawyer4@example.com")

    r = client.post(
        "/api/v1/cases",
        json={"title": "Private Case", "case_type": "Civil", "status": "Active", "priority": "Medium"},
        headers=lawyer,
    )
    case_id = r.json()["id"]
    report = client.post(f"/api/v1/cases/{case_id}/reports", json={"report_type": "case_summary"}, headers=lawyer)
    report_id = report.json()["id"]

    own_view = client.get(f"/api/v1/reports/{report_id}", headers=lawyer)
    assert own_view.status_code == 200
    assert "Private Case" in own_view.json()["content"]

    other_view = client.get(f"/api/v1/reports/{report_id}", headers=other_lawyer)
    assert other_view.status_code == 404


def test_report_generation_rejects_an_invalid_report_type(client):
    lawyer = register_user(client, email="reportlawyer5@example.com")

    r = client.post(
        "/api/v1/cases",
        json={"title": "Type Test Case", "case_type": "Civil", "status": "Active", "priority": "Medium"},
        headers=lawyer,
    )
    case_id = r.json()["id"]

    response = client.post(f"/api/v1/cases/{case_id}/reports", json={"report_type": "nonexistent_type"}, headers=lawyer)
    assert response.status_code == 422
