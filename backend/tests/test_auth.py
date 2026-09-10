from tests.constants import TEST_USER_ID
from sqlalchemy import text
from app import auth

def test_me_requires_a_cookie(client):
    assert client.get("/auth/me").status_code == 401


def test_me_rejects_a_bad_token(client):
    client.cookies.set("access_token", "nope")
    assert client.get("/auth/me").status_code == 401


def test_me_returns_the_current_user(client):
    client.cookies.set("access_token", "good-token")
    body = client.get("/auth/me").json()
    assert body == {"id": TEST_USER_ID, "email": "tester@example.com"}


def test_signup_returns_user_and_sets_cookies(client):
    r = client.post("/auth/signup", json={"email": "new@example.com", "password": "password123"})
    assert r.status_code == 200
    assert r.json() == {"id": TEST_USER_ID, "email": "new@example.com"}
    assert "access_token" in r.cookies and "refresh_token" in r.cookies


def test_signup_creates_the_users_row(client, db):
    client.post("/auth/signup", json={"email": "new@example.com", "password": "password123"})
    email = db.execute(text("SELECT email FROM users WHERE id = :id"), {"id": TEST_USER_ID}).scalar()
    assert email == "new@example.com"


def test_login_sets_cookies(client):
    r = client.post("/auth/login", json={"email": "me@example.com", "password": "password123"})
    assert r.status_code == 200
    assert "access_token" in r.cookies


def test_login_rejects_bad_credentials(client, monkeypatch):
    def boom(email, password):
        raise auth.AuthError("invalid login credentials")
    monkeypatch.setattr("app.auth.sign_in", boom)
    r = client.post("/auth/login", json={"email": "me@example.com", "password": "wrong"})
    assert r.status_code == 401


def test_refresh_issues_new_cookies(client):
    client.post("/auth/login", json={"email": "me@example.com", "password": "password123"})
    r = client.post("/auth/refresh")
    assert r.status_code == 200
    assert r.json()["id"] == TEST_USER_ID
    assert "access_token" in r.cookies


def test_refresh_without_a_cookie_401s(client):
    assert client.post("/auth/refresh").status_code == 401


def test_logout_clears_cookies(client):
    client.post("/auth/login", json={"email": "me@example.com", "password": "password123"})
    assert "access_token" in client.cookies
    assert client.post("/auth/logout").status_code == 204
    assert client.cookies.get("access_token") is None


def test_logout_without_a_session_is_ok(client):
    assert client.post("/auth/logout").status_code == 204