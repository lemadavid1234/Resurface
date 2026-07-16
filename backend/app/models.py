from datetime import datetime
from typing import Optional
from sqlalchemy import func
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base

from enum import Enum #Enum class for pending/completed/failed Screenshot status

#SQLAlchemy ORM (Object Relational Mapping) Model
#model tells SQLAlchemy: "here is what a Screenshot object looks like,
#and here's how it maps to a database table"

class ScreenshotStatus(Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"


#describes what's stored in the database
class Screenshot(Base):
    __tablename__ = "screenshots"
    
    #every table needs this
    id: Mapped[int] = mapped_column(primary_key=True)
    #required, so no optional
    image_url: Mapped[str]

    status: Mapped[ScreenshotStatus] = mapped_column(default=ScreenshotStatus.PENDING)

    #optional fields
    extracted_text: Mapped[Optional[str]]
    category: Mapped[Optional[str]]
    ai_summary: Mapped[Optional[str]]
    programming_language: Mapped[Optional[str]]
    source_platform: Mapped[Optional[str]]

    #Postgres itself fills in the timestamp when a row is inserted
    #via Postgres's own 'now()' function
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
