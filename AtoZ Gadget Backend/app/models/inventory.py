from sqlalchemy import Column, Integer, ForeignKey, String, DateTime, UniqueConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database.connection import Base


class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    variant_id = Column(Integer, ForeignKey("product_variants.id", ondelete="CASCADE"), nullable=True, index=True)
    
    stock_quantity = Column(Integer, default=0, nullable=False)
    reserved_quantity = Column(Integer, default=0, nullable=False)
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now(), server_default=func.now())

    # Relationships
    product = relationship("Product")
    variant = relationship("ProductVariant")

    __table_args__ = (
        UniqueConstraint("product_id", "variant_id", name="uq_product_variant_inventory"),
    )


class StockMovement(Base):
    __tablename__ = "stock_movements"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    type = Column(String(50), nullable=False)  # "purchase", "order", "return", "adjustment"
    quantity = Column(Integer, nullable=False)  # Positive or negative value
    reference_type = Column(String(50), nullable=True)  # e.g., "order", "return"
    reference_id = Column(Integer, nullable=True)
    
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    product = relationship("Product")
