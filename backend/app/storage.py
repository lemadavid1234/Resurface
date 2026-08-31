#storage.py is the one place in the backend that knows how to talk to Supabase Storage
#knows how to upload a file, get its public URL, delete a file
#nothing else in the app needs to know Supabase's specific API shape

#main.py will just call upload_screenshot(...) and delete_screenshot_file(...) as plain functions
#same way it calls classify_screenshot(...) from ai.py without knowing anything about
#OpenAI's API underneath

from app.config import SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_BUCKET
from supabase import create_client

client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)


def upload_screenshot(filename: str, contents: bytes, mime_type: str) -> str:
    client.storage.from_(SUPABASE_BUCKET).upload(
        filename,
        contents,
        {"content-type": mime_type},
    )

    return client.storage.from_(SUPABASE_BUCKET).get_public_url(filename)


def delete_screenshot_file(filename: str) -> None:
    client.storage.from_(SUPABASE_BUCKET).remove([filename])