from app.config import POSTGRES_HOST, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_PORT, POSTGRES_DB
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session

#connection string SQLAlchemy needs to reach Postgres (dialect+driver://user:pass@host:port/dbname)
database_url = f'postgresql+psycopg://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}'

#manages a pool of reusable connections to Postgres, built from database_url; doesn't connect yet
engine = create_engine(database_url)

class Base(DeclarativeBase):
    pass


#gurantees each request has it own "fresh cart", and that it gets properly close out when request is done
#designed to be driven by FastAPI's own dependency-injection machinery via (Depends(get_db))
def get_db():
    #creates a SQLAlchemy Session object
    #this session will obtain a database connection from the engine's pool
    #when it first needs to communicate with PostgresSQL
    db = Session(engine) 
    try:
        #pause and hand the session to the caller
        #yield - here's the db object, pause this function here until the caller is finished using it
        yield db
    finally:
        #once the route finishes (even if an exception occurs), FastAPI resumes the generator right after yield
        #session is always closed, returning its connection to the engine's connection pool
        db.close()
    
