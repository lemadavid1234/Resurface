"""add tsvector search column

Revision ID: 76da465f9a94
Revises: f9715c438d0b
Create Date: 2026-07-23 20:58:30.310279

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '76da465f9a94'
down_revision: Union[str, Sequence[str], None] = 'f9715c438d0b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("""
        ALTER TABLE screenshots
        ADD COLUMN text_search tsvector
        GENERATED ALWAYS AS (to_tsvector('english', coalesce(extracted_text, ''))) STORED;
    """)
    
    op.create_index(
        "ix_screenshots_text_search",
        "screenshots",
        ["text_search"],
        postgresql_using="gin"
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index("ix_screenshots_text_search", "screenshots")
    op.drop_column("screenshots", "text_search")
