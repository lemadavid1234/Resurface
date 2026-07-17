from app.database import engine
from sqlalchemy.orm import Session
from app.models import Screenshot
from app.main import app
from fastapi.testclient import TestClient

import os

client = TestClient(app)

def test_create_screenshot():
    response = client.post(
        "/screenshots",
        files={"file": ("test.png", b"fake image bytes", "image/png")},
    )
    assert response.status_code == 200
    body = response.json()

    assert body["image_url"].startswith("http://localhost:8000/uploads/")

    #cleanup - remove the row and file this test created
    filename = body["image_url"].split("/")[-1]
    with Session(engine) as db:
        screenshot = db.get(Screenshot, body["id"])
        db.delete(screenshot)
        db.commit()
    
    #interact with operating system to deelte a file from the filesystem after the test finishes
    os.remove(f"uploads/{filename}")


def test_list_screenshots():
    response = client.get("/screenshots")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
