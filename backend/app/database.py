import os

from pathlib import Path #instead of treating Path as string, it creates a Path object that has useful methods

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase


#find .env file in proj root and load its env variables into Python program
load_dotenv(Path(__file__).resolve().parents[2] / ".env")

database_url = f'postgresql+psycopg://{os.environ["POSTGRES_USER"]}:{os.environ["POSTGRES_PASSWORD"]}@localhost:{os.environ["POSTGRES_PORT"]}/{os.environ["POSTGRES_DB"]}'

engine = create_engine(database_url)

class Base(DeclarativeBase):
    pass

