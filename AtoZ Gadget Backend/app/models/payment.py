from sqlalchemy import Column, Integer, ForeignKey, String, Numeric, DateTime, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database.connection import Base


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
    
    payment_method = Column(String(50), nullable=False)  # "COD" or "Online"
    transaction_id = Column(String(100), nullable=True, index=True)
    amount = Column(Numeric(10, 2), nullable=False)
    payment_status = Column(String(50), default="pending")  # pending, paid, failed, refunded
    gateway_response = Column(Text, nullable=True)  # JSON payload log
    
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    order = relationship("Order", back_populates="payment")
