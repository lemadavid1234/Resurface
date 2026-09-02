# pytest imports conftest.py before any test module. That ordering is why the
# env bootstrap below works: it runs before 'from app.main import app' 
# (which triggers config.py reading os.environ at import time)

from pathlib import Path
from dotenv import load_dotenv

# .env.test points Postgres at the local resurface_test DB and sets fake
# Supabase / OpenAI values. override=True -> these beat anything already set
# (In CI there is no .env.test; the workflow's env block supplies the values.)
load_dotenv(Path(__file__).resolve().parents[1] / ".env.test", override=True)

#only safe to import app code AFTER the bootstrap above
import pytest
from alembic import command         # in order to run alembic migration programmatically
from alembic.config import Config   # instead of through the CLI
from fastapi.testclient import TestClient
from sqlalchemy import text

from app.main import app
from app.database import engine
from app.ai import ScreenshotClassification

@pytest.fixture(scope="session", autouse=True)
def apply_migrations():
    #build the schema once per test run, using the real migration chain
    #(the same command prod and CI run)
    #alembic/env.py already reuses the engine from database.py, which now points at
    #resurface_test
    command.upgrade(Config("alembic.ini"), "head")

@pytest.fixture(autouse=True)
def clean_tables():
    #guarantee every test starts with an empty table, whatever ran before
    #RESTART IDENTITY resets the id sequence back to 1
    with engine.begin() as conn:
        conn.execute(text("TRUNCATE screenshots RESTART IDENTITY CASCADE"))

    yield


@pytest.fixture(autouse=True)
def fake_externals(monkeypatch):
    #replace every real outbound call with an in-process fake.
    #Patched on app.main NOT app.storage / app.ai: main.py did 'from app.storage import
    #upload_screenshot' etc., so the name lives in app.main's namespace and
    #that's where the patch has to land
    
    def fake_upload_screenshot(filename, contents, mime_type):
        return f"https://fake.supabase.co/storage/v1/object/public/screenshots/{filename}"


    def fake_delete_screenshot_file(filename):
        return None

    def fake_classify_screenshot(contents, mime_type):
        return ScreenshotClassification(
            category="Test Category",
            ai_summary="A test screenshot",
            programming_language="Python",
            source_platform="Test",
        )

    class FakeReader:
        def readtext(self, contents):
            return [] # pretend OCR found no text

    monkeypatch.setattr("app.main.upload_screenshot", fake_upload_screenshot)
    monkeypatch.setattr("app.main.delete_screenshot_file", fake_delete_screenshot_file)
    monkeypatch.setattr("app.main.classify_screenshot", fake_classify_screenshot)
    monkeypatch.setattr("app.main.reader", FakeReader())


@pytest.fixture
def client():
    #in process HTTP client for the app - no server, no network.
    return TestClient(app)
