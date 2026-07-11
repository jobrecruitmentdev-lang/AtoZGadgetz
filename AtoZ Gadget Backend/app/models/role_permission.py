from sqlalchemy import (
    Column,
    Integer,
    ForeignKey,
    DateTime
)
from sqlalchemy.sql import func

from app.database.connection import Base


class RolePermission(Base):
    __tablename__ = "role_permissions"

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        index=True
    )

    role_id = Column(
        Integer,
        ForeignKey("roles.id"),
        nullable=False
    )

    permission_id = Column(
        Integer,
        ForeignKey("permissions.id"),
        nullable=False
    )

    created_at = Column(
        DateTime,
        server_default=func.now()
    )