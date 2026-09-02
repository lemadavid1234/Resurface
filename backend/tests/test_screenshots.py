#fixtures are not imported, that's why conftest.py is a special filename
#when pytest collects the tests, it finds every conftest.py from the root down to the test file's folder
#imports them itself, and registers their @pytest.fixture functions in a lookup table
#then for a test like test_create_screenshot(client):, pytest reads the parameter names, looks each one up
#in that table, runs the matching fixture, and passes the result in.
#Resolution is by name, not by import
# --> same reason never imported monkeypatch, it's a built in pytest fixture, injected by name

def test_create_screenshot(client):
    response = client.post(
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

def test_list_screenshots(client):

    #starts empty due to the clean_tables() fixure
    assert client.get("/screenshots").json() == []

    client.post(
        "/screenshots",
        files={"file": ("test.png", b"fake image bytes", "image/png")},
    )

    body = client.get("/screenshots").json()
    assert len(body) == 1
    assert body[0]["image_url"].startswith("https://fake.supabase.co/") #json array of json objects, list of dicts



def test_enrichment_populates_row(client):
    screenshot_id = client.post(
        "/screenshots",
        files={"file": ("test.png", b"fake image bytes", "image/png")},
    ).json()["id"]



    # TestClient runs the background tasks synchronously - run_enrichment has
    # already finished by the time the POST returns
    detail = client.get(f"/screenshots/{screenshot_id}").json()
    assert detail["status"] == "completed"
    assert detail["category"] == "Test Category"
    assert detail["programming_language"] == "Python"

