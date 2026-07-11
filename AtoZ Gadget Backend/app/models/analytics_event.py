from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, Index
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.connection import Base


class AnalyticsEvent(Base):
    """
    General-purpose analytics event store.
    Captures any trackable event with JSON payload.
    
    Events: page_view | product_view | search | add_to_cart |
            checkout_started | order_placed | payment_success |
            payment_failed | login | logout | register
    """
    __tablename__ = "analytics_events"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    session_id = Column(String(100), nullable=True)
    event_name = Column(String(100), nullable=False, index=True)
    event_data = Column(Text, nullable=True)   # JSON string payload
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(500), nullable=True)
    page_url = Column(String(500), nullable=True)
    referrer = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Relationship
    user = relationship("User", foreign_keys=[user_id])

    __table_args__ = (
        Index("ix_analytics_event_date", "event_name", "created_at"),
    )

    def __repr__(self):
        return f"<AnalyticsEvent event={self.event_name} user={self.user_id}>"
