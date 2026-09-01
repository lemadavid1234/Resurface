from app.config import POSTGRES_HOST, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_PORT, POSTGRES_DB
from app.config import API_BASE_URL, CORS_ORIGINS #testing on phone
import os

import psycopg #driver that lets FASTApi talk to Postgres

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

from fastapi import HTTPException

#sqlalchemy doesn't know about every SQL function that every database supports
#therefore has generic object called func: func.some_function(...) -SQLAlchemy gen SQL like-> some_function(...)
from sqlalchemy import func 

from app.ai import classify_screenshot

from app.storage import upload_screenshot, delete_screenshot_file

reader = easyocr.Reader(['en'], gpu=False)

#create a new FastAPI application
app = FastAPI()

#os creates dir if it's missing, and does nothing (no error) if it already exists
os.makedirs("uploads", exist_ok=True)
#anything saved into "/uploads" folder becomes reachable at http://localhost:8000/uploads/<filename>
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

#allow_origins: explicitly whitelisting frontend origin
#allow_methods: using GET, POST, later add DELETE
#allow_headers: permits the request headers frontend will actually send
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,#["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


#the route - decorator (@app.get("/health"))
#read endpoint decorator
@app.get("/health")
def health():
    try:
        conn = psycopg.connect(
            host=POSTGRES_HOST,
            port=POSTGRES_PORT,
            user=POSTGRES_USER,
            password=POSTGRES_PASSWORD,
            dbname=POSTGRES_DB,
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
    mime_type = file.content_type or "image/png"

    #push the raw bytes to a Supabase Storage bucket instead of the local uploads/ folder
    #returns the file's public URL, which we store on the row so the frontend loads it
    #straight from Supabase
    image_url = upload_screenshot(unique_filename, contents, mime_type)
    
    new_screenshot = Screenshot(image_url=image_url)
    db.add(new_screenshot) #tells SQLAlchemy, "when we save our changes, include this object"
    db.commit() #save it, SQLAlchem sends SQL statement to database. Now the row exists in Postgres. DB will autogenerate values.
    db.refresh(new_screenshot) #copies (id, created_at... etc) unknown values into new_screenshot object
    
    background_tasks.add_task(run_enrichment, new_screenshot.id, contents, mime_type)

    return new_screenshot #return this object back as the HTTP response to whoever made the request (to client)


@app.get("/screenshots", response_model=list[ScreenshotRead])
def list_screenshots(db: Session = Depends(get_db), q: str | None = None):
    
    #starts with a query representing: SELECT * FROM screenshots
    #query is a SQLAlchemy object that represents an entire SQL query against the screenshots table
    #base query returns all screenshots in order of descending created_at
    query = db.query(Screenshot)

    if q:
        #convert python string to PostgreSQL tsquery object
        tsquery = func.websearch_to_tsquery("english", q)

        query = (
            query
            #.filter builds the WHERE clause
            .filter(
            #returns a SQLAlchemy object that represents the SQL: "text_search @@ websearch_to_tsquery('english', q)"
            #.op("@@"): creates a function that applies the PostgreSQL @@ operator to this column
            Screenshot.text_search.op("@@")(tsquery) #PostgreSQL evaluates this condition for each row (using the GIN index to efficiently find matching rows).
            )
            .order_by(
                func.ts_rank( #PostgreSQL relavance scoring function for full-text search. 
                              #Given a document (tsvector) and a search query (tsquery), calculate how well the document matches the query
                    Screenshot.text_search,
                    tsquery
                ).desc()
            )
        )
    else:
        query = query.order_by(Screenshot.created_at.desc())
    
    #query.all() : send this completed SQL query to PostgreSQL and return the results
    #if q is empty: execute GET /screenshots by descending, else execute GET /screenshots?q=react hooks
    return query.all()




def run_enrichment(screenshot_id: int, contents: bytes, mime_type: str):
    
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
            result = reader.readtext(contents)
            #returns a list of only text that exceeds a confidence score of 0.5 from result (list of tuples)
            text_fragments = [text for (_, text, confidence_score) in result if confidence_score >= 0.5]
            
            #SQLAlchemy only tracks changes made directly to the mapped object's attributes
            screenshot.extracted_text = " ".join(text_fragments)

            #use ai classification method to fill remaining properties
            classification = classify_screenshot(contents, mime_type)
            
            screenshot.category = classification.category
            screenshot.ai_summary = classification.ai_summary
            screenshot.programming_language = classification.programming_language
            screenshot.source_platform = classification.source_platform

            screenshot.status = ScreenshotStatus.COMPLETED
        except Exception:
            screenshot.status = ScreenshotStatus.FAILED

        #any attribute edits are marked as "dirty" inside Sessions internal bookkeeping automatically (without calling db.add())
        db.commit() #when db.commit runs, Session looks at everything it's tracking, finds what's dirty and generates correct SQL


#whenever someone sends a DELETE request to /screenshots/{screenshot_id}, run delete_screenshot(), if successful return HTTP status code 204 (No Content)
@app.delete("/screenshots/{screenshot_id}", status_code=204)
def delete_screenshot(screenshot_id: int, db: Session = Depends(get_db)):

    screenshot = db.get(Screenshot, screenshot_id)

    #if screenshot not found, STOP function.
    #FastAPI catches that HTTPException and converts it into an HTTP response for the client
    #browser/client receieves: HTTP/1.1 404 Not Found, with a JSON body like { detail: "Screenshot not found" }
    if not screenshot:
        raise HTTPException(status_code=404, detail="Screenshot not found")

    #instead of removing from local storage (disk), remove from Supabase Storage
    #however currently files still live in local disk, so must perform
    #orphan cleanup/garbage collection
    if screenshot.image_url.startswith(API_BASE_URL):
        #remove file from local disk storage
        #local_path = screenshot.image_url.replace("http://localhost:8000/uploads/", "uploads/")
        filename = screenshot.image_url.split("/uploads/")[-1]
        local_path = f"uploads/{filename}"

        try:
            os.remove(local_path)
        except FileNotFoundError:
            pass

    else:
        # new style: file lives in Supabase Storage
        filename = screenshot.image_url.split("/")[-1]
        delete_screenshot_file(filename)
        
    db.delete(screenshot)
    db.commit()


@app.get("/screenshots/{screenshot_id}", response_model=ScreenshotRead)
def get_screenshot(screenshot_id: int, db: Session = Depends(get_db)):

    screenshot = db.get(Screenshot, screenshot_id)

    if not screenshot:
        raise HTTPException(status_code=404, detail="Screenshot not found")

    return screenshot

