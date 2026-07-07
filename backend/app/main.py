import os
from pathlib import Path
import psycopg

from dotenv import load_dotenv
from fastapi import FastAPI

#load .env file
load_dotenv(Path(__file__).resolve().parents[2] / ".env")

#create App
app = FastAPI()

#the route - decorator (@app.get("/health"))
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



