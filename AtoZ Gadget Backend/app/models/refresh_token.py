from sqlalchemy import Column, Integer, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database.connection import Base


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    token = Column(
        Text,
        nullable=False
    )

    expires_at = Column(
        DateTime,
        nullable=False
    )

    is_revoked = Column(
        Boolean,
        default=False
    )

    created_at = Column(
        DateTime,
        server_default=func.now()
    )

    # Relationships
    user = relationship("User", back_populates="refresh_tokens")