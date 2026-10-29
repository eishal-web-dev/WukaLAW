from tests.conftest import register_user


def test_ai_subscription_starts_with_100_free_tokens(client):
    headers = register_user(client, email="billing@example.com")
    response = client.get("/api/v1/billing/subscription", headers=headers)
    assert response.status_code == 200
    assert response.json()["status"] == "free"
    assert response.json()["free_token_limit"] == 100
    assert response.json()["free_tokens_remaining"] == 100
    assert response.json()["monthly_price"] == 1500
    assert response.json()["currency"] == "PKR"
