from app.config import OPENAI_API_KEY

from openai import OpenAI
from pydantic import BaseModel

from enum import Enum


import base64 #python module that handles Base64 encoding and decoding

#sdk already knows how to read api_key from environment, but this is explicitly reading the env variable and passing it to the client
#   aka: make the client construction explicit instead of relying on the SDK's own internal env lookup
client = OpenAI(api_key=OPENAI_API_KEY)

#str, Enum (not just Enum) so a Category member IS a plain string wherever one's expected
#ex: assigning classification.category straight into Screenshot.category (Mapped[Optional[str]])
#just works, and it serializes as a plain string in API responses, therefore no frontend changes are needed
class Category(str, Enum):
    CAREER_AND_INTERVIEW_PREP = "Career & Interview Prep"
    SYSTEM_DESIGN = "System Design"
    ALGORITHMS_AND_DATA_STRUCTURES = "Algorithms & Data Structures"
    WEB_DEVELOPMENT = "Web Development"
    BACKEND_AND_APIS = "Backend & APIs"
    AI_AND_MACHINE_LEARNING = "AI & Machine Learning"
    DEVOPS_AND_INFRASTRUCTURE = "DevOps & Infrastructure"
    GIT_AND_OPEN_SOURCE = "Git & Open Source"
    PROJECT_IDEAS = "Project Ideas"
    OTHER = "Other"


class ScreenshotClassification(BaseModel):
    category: Category # $ref to a Category definition whose only valid values are those strings
    ai_summary: str
    programming_language: str | None
    source_platform: str | None



SYSTEM_PROMPT = (
    "You are classifying a screenshot a student studying computer science and/or a software engineer saved from social media "
    "(YouTube Shorts, Instagram Reels, TikTok, Twitter/X, etc.) for later reference.\n\n"
    "Return the following fields:\n"
    "- category: pick the single best-fitting category from the fixed list. Use "
    "'Other' only if none of the other categories reasonably apply - don't force a poor fit.\n"
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

    # sends this schema (ScreenshotClassfication) as part of the actual API request, not just the field names
    # the response_format arguement, under the hood is this generated schema JSON Schema, attached to this request as 
    # {"type": "json_schema", "json_schema": {... , "strict": true}}
    completion = client.chat.completions.parse(
        model="gpt-5.6-luna",
        messages=messages,
        response_format=ScreenshotClassification,
    )

    return completion.choices[0].message.parsed