# Resurface Project

AI-powered screenshot organizer for programmers. Upload screenshots, extract text via OCR, classify content with AI, organize into categories, and search.

## Reasoning

I would often digest Software Engineering material through social media apps whenever I wasn't at my desk and would end up forgetting about them when I got home. I would later scroll through my photo gallery and find these very valuable and informative screenshots of specific code snippets, only to realize I had no idea what half of them were anymore, what video they came from, why I'd saved them, or what problem they solved. That possible knowledge was being taken away, and that screenshot marked the end of a learning moment instead of the start of something I could actually return to. I hope to solve that issue with this project.

## Stack

- Frontend: Next.js, React, TypeScript, Tailwind CSS
- Backend: Python, FastAPI
- Database: PostgreSQL
- OCR: EasyOCR
- AI: OpenAI API

## Status

The core walking skeleton is built and tested: a Next.js frontend, a FastAPI backend, and Postgres, all connected end to end. Screenshots can be uploaded through a real form in the browser, saved to disk, and listed back. The database schema is managed through tracked, reversible Alembic migrations, and includes a 'status' field ('PENDING'/'COMPLETED'/'FAILED') to track OCR/AI enrichment, which hasn't been built yet. OCR (EasyOCR) and AI classification (OpenAI) are the next major pieces. Also, uploaded screenshots are stored but not yet processed.

## Local development

Everything below runs locally. You'll need three things running at once, in this order:

1. **Start Docker Desktop**, then bring up Postgres:
    ```
    docker compose up -d db
    ```

2. **Start the backend** (from `backend/`):
   ```
   venv/bin/uvicorn app.main:app --reload --port 8000
   ```
   Backend runs at `http://localhost:8000`. Interactive API docs are
   available at `http://localhost:8000/docs`.

3. **Start the frontend** (from `frontend/`):
   ```
   npm run dev
   ```
   Frontend runs at `http://localhost:3000`. The screenshot list and
   upload form are at `http://localhost:3000/screenshots`.


To run the backend's automated tests (from `backend/`):
```
venv/bin/pytest
```

To apply database migrations after pulling new changes (from `backend/`):
```
venv/bin/alembic upgrade head
```
