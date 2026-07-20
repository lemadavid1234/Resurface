import os
from pathlib import Path
import psycopg #driver that lets FASTApi talk to Postgres

from dotenv import load_dotenv
from fastapi import FastAPI

from fastapi import Depends #for session dependency injection
from sqlalchemy.orm import Session #type annotation for db
from app.database import get_db, engine
from app.models import Screenshot, ScreenshotStatus
from app.schemas import ScreenshotRead

from fastapi import UploadFile, File #types for receiving a real uploaded file in a request
#UploadFile is a Python type (class), 
#contains useful info of uploaded file (.filename, .content_type, underlying file object: contents = file.file.read() )
#File - FastAPI funtion, tells FastAPI, look in the incoming HTTP request for a file upload, in FastAPI "..." means required vs File(None) which is optional

from fastapi.staticfiles import StaticFiles

import uuid #generate a unique name server-side for each screenshot

from fastapi.middleware.cors import CORSMiddleware #enables CORS: allows frontend to make cross-origin requests

import easyocr
from fastapi import BackgroundTasks

reader = easyocr.Reader(['en'], gpu=False)

#load .env file
load_dotenv(Path(__file__).resolve().parents[2] / ".env")

#create a new FastAPI application
app = FastAPI()

#anything saved into "/uploads" folder becomes reachable at http://localhost:8000/uploads/<filename>
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

#allow_origins: explicitly whitelisting frontend origin
#allow_methods: using GET, POST, later add DELETE
#allow_headers: permits the request headers frontend will actually send
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


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
def create_screenshot(background_tasks: BackgroundTasks, file: UploadFile = File(...), db: Session = Depends(get_db)):
    unique_filename = f"{uuid.uuid4()}_{file.filename}"
    contents = file.file.read()

    #write binary to filepath
    #read every byte from the uploaded temporary file and store those bytes in the variable contents
    with open(f"uploads/{unique_filename}", "wb") as f:
        f.write(contents)

    image_url = f"http://localhost:8000/uploads/{unique_filename}"
    
    new_screenshot = Screenshot(image_url=image_url)
    db.add(new_screenshot) #tells SQLAlchemy, "when we save our changes, include this object"
    db.commit() #save it, SQLAlchem sends SQL statement to database. Now the row exists in Postgres. DB will autogenerate values.
    db.refresh(new_screenshot) #copies (id, created_at... etc) unknown values into new_screenshot object
    
    background_tasks.add_task(run_ocr, new_screenshot.id, f"uploads/{unique_filename}")

    return new_screenshot #return this object back as the HTTP response to whoever made the request (to client)


@app.get("/screenshots", response_model=list[ScreenshotRead])
def list_screenshots(db: Session = Depends(get_db)):
    return db.query(Screenshot).all()


def run_ocr(screenshot_id: int, file_path: str):
    
    with Session(engine) as db:
        #db.get(ModelClass, primary_key). Telling SQLAlchemy: 1. Which table? 2. Which row?
        # --> .get() method: tells SQLAlchemy, "look in whatever table this class maps to"
        #screenshot: Python object representing specific row, with it's real column values loaded as attributes
        #screenshot: real instance of Screenshot Class
        #screenshot.id, screenshot.status, etc...
        #because Screenshot is a SQLAlchemy-mapped class, it's attributes aren't plain ordinary Python attributes
        #SQLAlchemy wraps each mapped column with special logic (called instrumentation) that intercepts reads and writes.
        screenshot = db.get(Screenshot, screenshot_id)

        try:
            result = reader.readtext(file_path)
            #returns a list of only text that exceeds a confidence score of 0.5 from result (list of tuples)
            text_fragments = [text for (_, text, confidence_score) in result if confidence_score >= 0.5]
            
            #SQLAlchemy only tracks changes made directly to the mapped object's attributes
            screenshot.extracted_text = " ".join(text_fragments)

            screenshot.status = ScreenshotStatus.COMPLETED
        except Exception:
            screenshot.status = ScreenshotStatus.FAILED

        #any attribute edits are marked as "dirty" inside Sessions internal bookkeeping automatically (without calling db.add())
        db.commit() #when db.commit runs, Session looks at everything it's tracking, finds what's dirty and generates correct SQL

