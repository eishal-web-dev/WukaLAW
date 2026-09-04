def test_local_vite_origin_is_allowed_on_any_port(client):
    response = client.options(
        "/api/v1/health",
        headers={
            "Origin": "http://localhost:5174",
            "Access-Control-Request-Method": "GET",
        },
    )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:5174"
