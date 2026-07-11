from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database.connection import Base


class Offer(Base):
    __tablename__ = "offers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(String(500), nullable=True)
    
    offer_type = Column(String(50), nullable=False)  # "Product", "Category", "Cart", "Festival"
    discount_type = Column(String(20), nullable=False)  # "Percentage" or "Flat"
    discount_value = Column(Numeric(10, 2), nullable=False)
    minimum_order_amount = Column(Numeric(10, 2), default=0.00, nullable=False)
    maximum_discount = Column(Numeric(10, 2), nullable=True)  # Maximum discount cap
    
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    status = Column(String(20), default="active")  # "active" or "inactive"
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now(), server_default=func.now())

    # Relationships
    products = relationship("OfferProduct", back_populates="offer", cascade="all, delete-orphan")
    categories = relationship("OfferCategory", back_populates="offer", cascade="all, delete-orphan")


class OfferProduct(Base):
    __tablename__ = "offer_products"

    id = Column(Integer, primary_key=True, index=True)
    offer_id = Column(Integer, ForeignKey("offers.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)

    # Relationships
    offer = relationship("Offer", back_populates="products")
    product = relationship("Product")


class OfferCategory(Base):
    __tablename__ = "offer_categories"

    id = Column(Integer, primary_key=True, index=True)
    offer_id = Column(Integer, ForeignKey("offers.id", ondelete="CASCADE"), nullable=False, index=True)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="CASCADE"), nullable=False, index=True)

    # Relationships
    offer = relationship("Offer", back_populates="categories")
    category = relationship("Category")
