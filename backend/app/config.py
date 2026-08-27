import os
from pathlib import Path #instead of treating Path as string, it creates a Path object that has useful methods
from dotenv import load_dotenv

#find .env file in proj root and load its env variables into Python program
load_dotenv(Path(__file__).resolve().parents[2] / ".env")

POSTGRES_USER = os.environ["POSTGRES_USER"]
POSTGRES_PASSWORD = os.environ["POSTGRES_PASSWORD"]
POSTGRES_PORT = os.environ["POSTGRES_PORT"]
POSTGRES_DB = os.environ["POSTGRES_DB"]
OPENAI_API_KEY = os.environ["OPENAI_API_KEY"]

API_BASE_URL = os.environ.get("API_BASE_URL", "http://localhost:8000")
CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "http://localhost:3000").split(",")