import os
from pathlib import Path
import psycopg #driver that lets FASTApi talk to Postgres

from dotenv import load_dotenv
from fastapi import FastAPI

from fastapi import Depends #for session dependency injection
from sqlalchemy.orm import Session #type annotation for db
from app.database import get_db
from app.models import Screenshot
from app.schemas import ScreenshotCreate, ScreenshotRead


#load .env file
load_dotenv(Path(__file__).resolve().parents[2] / ".env")

#create App
app = FastAPI()

#the route - decorator (@app.get("/health"))
#read endpoint decorator
@app.get("/health")
def health():
    #attempt to open a psycopg connection to host="localhost",
    #using 4 Postgres env vars in .env
    try:
        conn = psycopg.connect(
            host="localhost",
            port=os.environ["POSTGRES_PORT"],
            user=os.environ["POSTGRES_USER"],
            password=os.environ["POSTGRES_PASSWORD"],
            dbname=os.environ["POSTGRES_DB"],
        )
        conn.execute("SELECT 1")
        conn.close()
        db_status = "connected"
    except psycopg.OperationalError as e:
        db_status = f"error: {e}"

    
    return {"status": "ok", "db": db_status}

#create endpoint decorator
@app.post("/screenshots", response_model=ScreenshotRead)
def create_screenshot(screenshot: ScreenshotCreate, db: Session = Depends(get_db)):
    new_screenshot = Screenshot(image_url=screenshot.image_url)
    db.add(new_screenshot)
    db.commit()
    db.refresh(new_screenshot)
    
    return new_screenshot


@app.get("/screenshots", response_model=list[ScreenshotRead])
def list_screenshots(db: Session = Depends(get_db)):
    return db.query(Screenshot).all()