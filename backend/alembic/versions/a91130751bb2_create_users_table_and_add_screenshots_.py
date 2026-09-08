"""create users table and add screenshots.user_id

Revision ID: a91130751bb2
Revises: 76da465f9a94
Create Date: 2026-09-08 16:46:12.731827

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a91130751bb2'
down_revision: Union[str, Sequence[str], None] = '76da465f9a94'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    op.create_table('users',
    sa.Column('id', sa.Uuid(), nullable=False),
    sa.Column('email', sa.String(), nullable=False),
    sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('email')
    )
    op.add_column('screenshots', sa.Column('user_id', sa.Uuid(), nullable=True))
    op.create_foreign_key('screenshots_user_id_fkey', 'screenshots', 'users', ['user_id'], ['id'])


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_constraint('screenshots_user_id_fkey', 'screenshots', type_='foreignkey')
    op.drop_column('screenshots', 'user_id')
    op.drop_table('users')

