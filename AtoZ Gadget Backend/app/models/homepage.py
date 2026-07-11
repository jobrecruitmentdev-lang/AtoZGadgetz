from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database.connection import Base


class HomepageSection(Base):
    __tablename__ = "homepage_sections"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    section_type = Column(String(100), nullable=False)  # "Featured Products", "Trending Products", "New Arrivals"
    sort_order = Column(Integer, default=0)
    status = Column(String(20), default="active")  # "active" or "inactive"
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now(), server_default=func.now())

    # Relationships
    featured_products = relationship("FeaturedProduct", back_populates="section", cascade="all, delete-orphan")


class FeaturedProduct(Base):
    __tablename__ = "featured_products"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    section_id = Column(Integer, ForeignKey("homepage_sections.id", ondelete="CASCADE"), nullable=False, index=True)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    section = relationship("HomepageSection", back_populates="featured_products")
    product = relationship("Product")
