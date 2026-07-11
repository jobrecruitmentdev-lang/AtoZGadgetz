from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Index
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.connection import Base


class UserBehaviour(Base):
    """
    Tracks fine-grained user interactions with products.
    Used by the AI recommendation engine.
    
    Actions: view | click | wishlist | cart | purchase | remove_cart | remove_wishlist
    """
    __tablename__ = "user_behaviour"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    action = Column(String(30), nullable=False)  # view, click, wishlist, cart, purchase
    session_id = Column(String(100), nullable=True)  # optional anonymous session tracking
    source = Column(String(50), nullable=True)   # homepage | search | recommendation | category
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    product = relationship("Product", foreign_keys=[product_id])

    __table_args__ = (
        Index("ix_behaviour_user_product", "user_id", "product_id"),
        Index("ix_behaviour_product_action", "product_id", "action"),
    )

    def __repr__(self):
        return f"<UserBehaviour user={self.user_id} product={self.product_id} action={self.action}>"
