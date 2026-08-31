from app.config import OPENAI_API_KEY

from openai import OpenAI
from pydantic import BaseModel


import base64 #python module that handles Base64 encoding and decoding
import mimetypes #module that converts between a filename or URL and the MIME type associated with the file extension

#sdk already knows how to read api_key from environment, but this is explicitly reading the env variable and passing it to the client
#   aka: make the client construction explicit instead of relying on the SDK's own internal env lookup
client = OpenAI(api_key=OPENAI_API_KEY)

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

def classify_screenshot(contents: bytes, mime_type: str) -> ScreenshotClassification : 

    #b64 encode returns bytes, not a string, so .decode("utf-8") converts
    #the Base64 into a Python string that can be embedded in JSON
    encoded_image = base64.b64encode(contents).decode("utf-8")
    

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