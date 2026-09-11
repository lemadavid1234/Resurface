from pydantic import BaseModel, ConfigDict
from datetime import datetime

from app.models import ScreenshotStatus

#Schemas are the request/response contract

#schema describing what actually gets sent back to the client
#describes what your API returns to the client after the screenshot has been created or retreived

#this is the shape of a Screenshot when reading data from the API

# ---- responses (what the API sends back) ----
class ScreenshotRead(BaseModel):
    #Pydantic needs to know it's allowed to read data off of it by attribute access
    #by default Pydantic v2 expects to build a model from a plain dict, not an abitratry Python object
    model_config = ConfigDict(from_attributes=True)

    id: int
    image_url: str
    extracted_text: str | None
    category: str | None
    ai_summary: str | None
    programming_language: str | None
    source_platform: str | None

    status: ScreenshotStatus

    created_at: datetime


class UserRead(BaseModel):
    """UserRead exists to define the API's response shape for 'a user' - 
    the JSON that /auth/me, /auth/signup, /auth/login, /auth/refresh all send back.
    those four endpoints need one consistent, documented shape for a user, that's UserRead"""
    id: str
    email: str | None


# ---- request bodies (what the client sends in) ----
class Credentials(BaseModel):
    email: str
    password: str



