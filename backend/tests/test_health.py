from fastapi.testclient import TestClient
from app.main import app

import psycopg

#instantiate client once
client = TestClient(app)


def test_health():
    response = client.get("/health")

    #assert code expectations
    assert response.status_code == 200
    body = response.json()

    assert body["status"] == "ok"
    assert body["db"] == "connected"


def test_health_when_db_is_down(monkeypatch):

    def fake_function(*args, **kwargs):
        raise psycopg.OperationalError("simulated failure")
    
    monkeypatch.setattr(psycopg, "connect", fake_function)

    response = client.get("/health")
    assert response.status_code == 200

    body = response.json()

    assert body["status"] == "ok"
    assert "error" in body["db"]