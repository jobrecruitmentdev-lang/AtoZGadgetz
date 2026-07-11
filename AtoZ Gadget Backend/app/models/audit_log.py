from sqlalchemy import Column, Integer, ForeignKey, String, DateTime, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database.connection import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    module = Column(String(100), nullable=False)  # "Product", "Order", "Inventory", "Banner", "Offer", "Auth"
    action = Column(String(100), nullable=False)  # "Create", "Update", "Delete", "Price Change", "Status Change"
    description = Column(Text, nullable=False)
    
    # Store JSON strings for tracking historical data audits
    old_data = Column(Text, nullable=True)
    new_data = Column(Text, nullable=True)
    
    ip_address = Column(String(50), nullable=True)
    user_agent = Column(String(500), nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    user = relationship("User")
