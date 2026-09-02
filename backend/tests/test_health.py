import psycopg

#test_health will fail if the Docker container is down

def test_health(client):
    response = client.get("/health")

    #assert code expectations
    assert response.status_code == 200
    body = response.json()

    assert body["status"] == "ok"
    assert body["db"] == "connected"


def test_health_when_db_is_down(client, monkeypatch):

    def fake_function(*args, **kwargs):
        raise psycopg.OperationalError("simulated failure")
    
    monkeypatch.setattr(psycopg, "connect", fake_function)

    response = client.get("/health")
    assert response.status_code == 200

    body = response.json()

    assert body["status"] == "ok"
    assert "error" in body["db"]