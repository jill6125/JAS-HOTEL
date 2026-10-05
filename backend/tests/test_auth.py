"""Authentication test suite covering signup, login, session inspection, and logout."""

import pytest


def test_signup_success(client):
    """Test successful user registration creates user and establishes session."""
    payload = {
        "name": "Aarav Sharma",
        "email": "aarav.sharma@example.com",
        "password": "Password1234",
    }
    response = client.post("/api/auth/signup", json=payload)
    assert response.status_code == 201

    data = response.get_json()
    assert "user" in data
    assert data["user"]["name"] == "Aarav Sharma"
    assert data["user"]["email"] == "aarav.sharma@example.com"
    assert "password_hash" not in data["user"]
    assert "id" in data["user"]

    # Verify session is established
    me_resp = client.get("/api/auth/me")
    assert me_resp.status_code == 200
    assert me_resp.get_json()["authenticated"] is True


def test_signup_duplicate_email(client):
    """Test duplicate registration returns 409 conflict."""
    payload = {
        "name": "Pooja Patel",
        "email": "pooja@example.com",
        "password": "SecretPassword123",
    }
    resp1 = client.post("/api/auth/signup", json=payload)
    assert resp1.status_code == 201

    # Attempt signup again with same email (case variation)
    payload2 = {
        "name": "Pooja Patel Second",
        "email": "POOJA@example.com",
        "password": "DifferentPassword123",
    }
    resp2 = client.post("/api/auth/signup", json=payload2)
    assert resp2.status_code == 409
    data = resp2.get_json()
    assert data["error"]["code"] == "EMAIL_CONFLICT"


def test_signup_invalid_payload(client):
    """Test validation failure for short password or missing fields."""
    # Missing name
    resp = client.post("/api/auth/signup", json={"email": "test@example.com", "password": "pass"})
    assert resp.status_code == 422
    assert "name" in resp.get_json()["error"]["fields"]

    # Short password
    resp = client.post("/api/auth/signup", json={
        "name": "Test User",
        "email": "test@example.com",
        "password": "short",
    })
    assert resp.status_code == 422
    assert "password" in resp.get_json()["error"]["fields"]


def test_login_success(client):
    """Test user login with valid credentials."""
    # First signup
    client.post("/api/auth/signup", json={
        "name": "Rohan Mehra",
        "email": "rohan@example.com",
        "password": "MySecretPass123",
    })

    # Clear session by logging out
    client.post("/api/auth/logout")

    # Login
    login_resp = client.post("/api/auth/login", json={
        "email": "rohan@example.com",
        "password": "MySecretPass123",
    })
    assert login_resp.status_code == 200
    user_data = login_resp.get_json()["user"]
    assert user_data["name"] == "Rohan Mehra"
    assert "password_hash" not in user_data


def test_login_invalid_credentials(client):
    """Test login failure returns 401 without revealing whether email exists."""
    resp = client.post("/api/auth/login", json={
        "email": "nonexistent@example.com",
        "password": "WrongPassword123",
    })
    assert resp.status_code == 401
    assert resp.get_json()["error"]["code"] == "INVALID_CREDENTIALS"


def test_current_user_unauthenticated(client):
    """Test /api/auth/me returns authenticated: false when no session exists."""
    client.post("/api/auth/logout")
    resp = client.get("/api/auth/me")
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["authenticated"] is False
    assert data["user"] is None


def test_logout(authenticated_client):
    """Test logout clears session."""
    resp = authenticated_client.post("/api/auth/logout")
    assert resp.status_code == 200

    me_resp = authenticated_client.get("/api/auth/me")
    assert me_resp.get_json()["authenticated"] is False
