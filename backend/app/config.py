import os
from pathlib import Path #instead of treating Path as string, it creates a Path object that has useful methods
from typing import Literal, cast, get_args
from dotenv import load_dotenv

#find .env file in proj root and load its env variables into Python program
load_dotenv(Path(__file__).resolve().parents[2] / ".env")

POSTGRES_HOST = os.environ["POSTGRES_HOST"]
POSTGRES_USER = os.environ["POSTGRES_USER"]
POSTGRES_PASSWORD = os.environ["POSTGRES_PASSWORD"]
POSTGRES_PORT = os.environ["POSTGRES_PORT"]
POSTGRES_DB = os.environ["POSTGRES_DB"]
OPENAI_API_KEY = os.environ["OPENAI_API_KEY"]

CORS_ORIGIN = os.environ["CORS_ORIGIN"]

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_ROLE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
SUPABASE_BUCKET = os.environ["SUPABASE_BUCKET"]
SUPABASE_ANON_KEY = os.environ["SUPABASE_ANON_KEY"]

#cookie flags - dev defaults; prod sets COOKIE_SECURE=true. COOKIE_SAMESITE=none
COOKIE_SECURE = os.environ.get("COOKIE_SECURE", "false").lower() == "true"

#Starlette's set_cookie/delete_cookie only accept these three values, but an env var is just a string:
#check it once at startup instead of finding out on the first login
SameSite = Literal["lax", "strict", "none"]
_samesite = os.environ.get("COOKIE_SAMESITE", "lax").lower()
if _samesite not in get_args(SameSite):
    raise ValueError(f"COOKIE_SAMESITE must be one of {get_args(SameSite)}, got {_samesite!r}")
COOKIE_SAMESITE = cast(SameSite, _samesite) #safe: just checked above

