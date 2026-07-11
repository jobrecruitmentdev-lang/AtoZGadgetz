from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database.connection import Base


class Role(Base):
    __tablename__ = "roles"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    role_name = Column(
        String(100),
        unique=True,
        nullable=False
    )

    description = Column(
        String(255),
        nullable=True
    )

    created_at = Column(
        DateTime,
        server_default=func.now()
    )

    # Relationships
    users = relationship("User", back_populates="role")
    permissions = relationship("Permission", secondary="role_permissions", back_populates="roles")