from sqlalchemy import Column, Integer, ForeignKey, DateTime, Text, String
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database.connection import Base


class ProductReview(Base):
    __tablename__ = "product_reviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    rating = Column(Integer, nullable=False)  # 1 to 5 stars
    review = Column(Text, nullable=True)
    status = Column(String(20), default="approved")  # "approved", "pending"
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    user = relationship("User")
    product = relationship("Product", backref="reviews")
