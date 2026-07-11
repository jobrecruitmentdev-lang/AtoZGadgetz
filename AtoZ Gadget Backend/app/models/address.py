from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    ForeignKey,
    DateTime
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database.connection import Base


class UserAddress(Base):
    __tablename__ = "user_addresses"

    id = Column(
        Integer,
        primary_key=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )

    address_type = Column(
        String(50),
        default="Home"  # "Home" or "Office"
    )

    full_name = Column(
        String(100),
        nullable=False
    )

    mobile = Column(
        String(20),
        nullable=False
    )

    address_line1 = Column(
        String(255),
        nullable=False
    )

    address_line2 = Column(
        String(255),
        nullable=True
    )

    city = Column(
        String(100),
        nullable=False
    )

    state = Column(
        String(100),
        nullable=False
    )

    country = Column(
        String(100),
        default="India"
    )

    pincode = Column(
        String(10),
        nullable=False
    )

    is_default = Column(
        Boolean,
        default=False
    )

    created_at = Column(
        DateTime,
        server_default=func.now()
    )

    updated_at = Column(
        DateTime,
        onupdate=func.now(),
        server_default=func.now()
    )

    # Relationships
    user = relationship("User", back_populates="addresses")