from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database.connection import Base


class Permission(Base):
    __tablename__ = "permissions"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
        autoincrement=True
    )

    permission_name = Column(
        String(100),
        unique=True,
        nullable=False
    )

    module_name = Column(
        String(100),
        nullable=False
    )

    description = Column(
        Text,
        nullable=True
    )

    created_at = Column(
        DateTime,
        server_default=func.now()
    )

    # Relationships
    roles = relationship("Role", secondary="role_permissions", back_populates="permissions")