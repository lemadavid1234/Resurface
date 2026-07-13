from pydantic import BaseModel, ConfigDict

#schema describing what actually gets sent back to the client
#describes what your API returns to the client after the screenshot has been created or retreived
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


