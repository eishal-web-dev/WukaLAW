import io

import pytest
from sqlalchemy import text

from app.db import engine
from tests.conftest import SAMPLE_JUDGMENT, register_user


@pytest.mark.parametrize('role', ['client', 'lawyer'])
def test_signup_persists_the_selected_account_role(client, role):
    response = client.post('/api/v1/auth/register', json={
        'email': f'{role}@example.com', 'name': 'Portal User', 'password': 'secret123', 'role': role,
    })
    assert response.status_code == 201, response.text
    assert response.json()['user']['role'] == role
    headers = {'Authorization': f"Bearer {response.json()['token']}"}
    assert client.get('/api/v1/auth/me', headers=headers).json()['role'] == role
    notifications = client.get('/api/v1/notifications', headers=headers).json()['items']
    assert notifications[0]['action_url'] == ('/client' if role == 'client' else '/dashboard')
    assert client.get('/api/v1/admin/stats', headers=headers).status_code == 403


@pytest.mark.parametrize('role', ['client', 'lawyer', 'admin'])
@pytest.mark.parametrize('portal', ['client', 'lawyer', 'admin'])
def test_login_requires_matching_account_role_without_changing_it(client, role, portal):
    headers = register_user(client, email='portal@example.com')
    with engine.begin() as connection:
        connection.execute(text('UPDATE users SET role = :role'), {'role': role})
    response = client.post('/api/v1/auth/login', json={
        'email': 'portal@example.com', 'password': 'secret123', 'portal': portal,
    })
    if role == portal:
        assert response.status_code == 200, response.text
        assert response.json()['user']['role'] == role
        assert response.json()['token']
    else:
        assert response.status_code == 403, response.text
        assert 'token' not in response.json()
    assert client.get('/api/v1/auth/me', headers=headers).json()['role'] == role


def test_wrong_password_is_rejected_before_portal_validation(client):
    register_user(client)
    response = client.post('/api/v1/auth/login', json={
        'email': 'tester@example.com', 'password': 'wrong-password', 'portal': 'admin',
    })
    assert response.status_code == 401
    assert response.json()['detail'] == 'Invalid email or password.'


def test_unknown_portal_is_rejected(client):
    response = client.post('/api/v1/auth/login', json={
        'email': 'tester@example.com', 'password': 'secret123', 'portal': 'superadmin',
    })
    assert response.status_code == 422


def test_client_documents_remain_private_from_lawyer_accounts(client):
    response = client.post('/api/v1/auth/register', json={
        'email': 'client@example.com', 'name': 'Client User', 'password': 'secret123', 'role': 'client',
    })
    client_headers = {'Authorization': f"Bearer {response.json()['token']}"}
    lawyer_headers = register_user(client, email='lawyer@example.com')
    upload = client.post('/api/v1/documents/upload',
        files={'file': ('case.txt', io.BytesIO(SAMPLE_JUDGMENT.encode()), 'text/plain')},
        headers=client_headers,
    )
    assert upload.status_code == 201, upload.text
    document_id = upload.json()['id']
    assert client.get(f'/api/v1/documents/{document_id}', headers=client_headers).status_code == 200
    assert client.get(f'/api/v1/documents/{document_id}', headers=lawyer_headers).status_code == 404
    assert client.get('/api/v1/documents', headers=lawyer_headers).json()['total'] == 0
