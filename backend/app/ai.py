from pathlib import Path

from dotenv import load_dotenv
from openai import OpenAI
from pydantic import BaseModel

import base64 #python module that handles Base64 encoding and decoding
import mimetypes #module that converts between a filename or URL and the MIME type associated with the file extension

load_dotenv(Path(__file__).resolve().parents[2] / ".env")

client = OpenAI()

class ScreenshotClassification(BaseModel):
    category: str
    ai_summary: str
    programming_language: str | None
    source_platform: str | None

SYSTEM_PROMPT = (
    "You are classifying a screenshot a software engineer saved from social media "
    "(YouTube Shorts, Instagram Reels, TikTok, Twitter/X, etc.) for later reference.\n\n"
    "Return the following fields:\n"
    "- category: a short label for the content (a specific technology or a general "
    "topic like 'career advice' or 'system design').\n"
    "- ai_summary: a 1–2 sentence summary of what the screenshot shows or teaches.\n"
    "- programming_language: the language shown, if any; otherwise null.\n"
    "- source_platform: which platform this is from, inferred from the visible UI "
    "chrome; otherwise null if you can't tell."

)

def classify_screenshot(file_path: str) -> ScreenshotClassification : 

    #b64encode returns bytes, not a string, so .decode("utf-8") converts the Base64 into a Python string I can embed in JSON
    #previously this was: encoded_image = base64.b64encode(open(file_path, "rb").read()).decode("utf-8")

    #that opened the file but never explicitly closed it. In CPython the file is usually closed quickly
    #once the file object is no longer referenced, but this behavior isn't something code should rely on.
    #Using a 'with' statement guarantees the file is closed immediately, even if an exception occurs
    with open(file_path, "rb") as f:
        encoded_image = base64.b64encode(f.read()).decode("utf-8")


    #try to detect the media type, if fails, assume PNG
    mime_type = mimetypes.guess_type(file_path)[0] or "image/png"

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "Classify this screenshot."},
                {"type": "image_url", "image_url": {"url": f"data:{mime_type};base64,{encoded_image}"},},
            ],
        },
    ]

    completion = client.chat.completions.parse(
        model="gpt-5.6-luna",
        messages=messages,
        response_format=ScreenshotClassification,
    )

    return completion.choices[0].message.parsed