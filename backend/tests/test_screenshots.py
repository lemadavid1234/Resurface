#fixtures are not imported, that's why conftest.py is a special filename
#when pytest collects the tests, it finds every conftest.py from the root down to the test file's folder
#imports them itself, and registers their @pytest.fixture functions in a lookup table
#then for a test like test_create_screenshot(client):, pytest reads the parameter names, looks each one up
#in that table, runs the matching fixture, and passes the result in.
#Resolution is by name, not by import
# --> same reason never imported monkeypatch, it's a built in pytest fixture, injected by name

import uuid
from app.models import Screenshot, User


def test_create_screenshot(authed_client):
    response = authed_client.post(
        "/screenshots",
        files={"file": ("test.png", b"fake image bytes", "image/png")},
    )
    assert response.status_code == 200
    body = response.json()

    #the endpoint stores whatever upload_screenshot returned and echoes it back 
    #(in tests that's conftest's fake URL)
    assert body["image_url"].startswith("https://fake.supabase.co/")

    #status is serialized before the background tasks runs
    assert body["status"] == "pending"


def test_list_screenshots(authed_client):

    #starts empty due to the clean_tables() fixure
    assert authed_client.get("/screenshots").json() == []

    authed_client.post(
        "/screenshots",
        files={"file": ("test.png", b"fake image bytes", "image/png")},
    )

    body = authed_client.get("/screenshots").json()
    assert len(body) == 1
    assert body[0]["image_url"].startswith("https://fake.supabase.co/") #json array of json objects, list of dicts


def test_enrichment_populates_row(authed_client):
    screenshot_id = authed_client.post(
        "/screenshots",
        files={"file": ("test.png", b"fake image bytes", "image/png")},
    ).json()["id"]

    # TestClient runs the background tasks synchronously - run_enrichment has
    # already finished by the time the POST returns
    detail = authed_client.get(f"/screenshots/{screenshot_id}").json()
    assert detail["status"] == "completed"
    assert detail["category"] == "Test Category"
    assert detail["programming_language"] == "Python"


def test_screenshots_require_auth(client):
    assert client.get("/screenshots").status_code == 401


def test_you_only_see_your_own_screenshots(authed_client, db):
    other = uuid.UUID("00000000-0000-0000-0000-000000000002")
    db.add(User(id=other, email="other@example.com"))
    db.commit()                                   # parent must land first
    db.add(Screenshot(image_url="not-yours", user_id=other))
    db.commit()

    authed_client.post("/screenshots", files={"file": ("t.png", b"bytes", "image/png")})
    body = authed_client.get("/screenshots").json()
    assert len(body) == 1
    assert body[0]["image_url"].startswith("https://fake.supabase.co/")


def test_cannot_read_another_users_screenshot(authed_client, db):
    other = uuid.UUID("00000000-0000-0000-0000-000000000002")
    db.add(User(id=other, email="other@example.com"))
    db.commit()
    s = Screenshot(image_url="not-yours", user_id=other)
    db.add(s)
    db.commit()
    db.refresh(s)
    assert authed_client.get(f"/screenshots/{s.id}").status_code == 404