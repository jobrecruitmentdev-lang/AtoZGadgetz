from sqlalchemy import Column, Integer, ForeignKey, String, DateTime, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database.connection import Base


class ReturnOrder(Base):
    __tablename__ = "returns"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    reason = Column(Text, nullable=False)
    status = Column(String(50), default="requested")  # "requested", "approved", "rejected", "completed"
    
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    order = relationship("Order", back_populates="returns")
    user = relationship("User")
