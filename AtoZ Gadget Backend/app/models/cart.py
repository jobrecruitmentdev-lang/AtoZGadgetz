from sqlalchemy import Column, Integer, ForeignKey, DateTime, Numeric
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database.connection import Base


class Cart(Base):
    __tablename__ = "carts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now(), server_default=func.now())

    # Relationships
    user = relationship("User", backref="cart")
    items = relationship("CartItem", back_populates="cart", cascade="all, delete-orphan")


class CartItem(Base):
    __tablename__ = "cart_items"

    id = Column(Integer, primary_key=True, index=True)
    cart_id = Column(Integer, ForeignKey("carts.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    quantity = Column(Integer, default=1, nullable=False)
    price = Column(Numeric(10, 2), nullable=False)  # Storing price at checkout preview/addition time
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    cart = relationship("Cart", back_populates="items")
    product = relationship("Product")
