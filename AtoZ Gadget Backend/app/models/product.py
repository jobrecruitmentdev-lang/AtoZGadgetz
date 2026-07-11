from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Numeric, Float, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database.connection import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="RESTRICT"), nullable=False)
    subcategory_id = Column(Integer, ForeignKey("sub_categories.id", ondelete="RESTRICT"), nullable=False)
    brand_id = Column(Integer, ForeignKey("brands.id", ondelete="SET NULL"), nullable=True)

    name = Column(String(255), index=True, nullable=False)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    short_description = Column(Text, nullable=True)
    description = Column(Text, nullable=True)

    sku = Column(String(100), unique=True, index=True, nullable=False)
    barcode = Column(String(100), unique=True, index=True, nullable=True)

    price = Column(Numeric(10, 2), index=True, nullable=False)
    discount_price = Column(Numeric(10, 2), nullable=True)
    tax_percentage = Column(Numeric(5, 2), default=0.00)

    stock_quantity = Column(Integer, default=0, nullable=False)

    weight = Column(Float, nullable=True)
    length = Column(Float, nullable=True)
    width = Column(Float, nullable=True)
    height = Column(Float, nullable=True)

    thumbnail_image = Column(String(255), nullable=True)

    # Extended Inventory & Shopify Integration Columns
    handle = Column(String(255), index=True, nullable=True)
    title = Column(String(255), index=True, nullable=True)
    option1_name = Column(String(100), nullable=True)
    option2_name = Column(String(100), nullable=True)
    option3_name = Column(String(100), nullable=True)
    hs_code = Column(String(100), nullable=True)
    country_of_origin = Column(String(100), nullable=True)
    location = Column(String(100), nullable=True)
    bin_name = Column(String(100), nullable=True)
    incoming = Column(Integer, default=0, nullable=False)
    unavailable = Column(Integer, default=0, nullable=False)
    committed = Column(Integer, default=0, nullable=False)
    available = Column(Integer, default=0, nullable=False)
    onhand_old = Column(Integer, default=0, nullable=False)
    onhand_new = Column(Integer, default=0, nullable=False)

    status = Column(String(50), default="active")
    is_featured = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)

    created_by = Column(Integer, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now(), server_default=func.now())

    # Relationships
    category = relationship("Category", back_populates="products")
    subcategory = relationship("SubCategory", back_populates="products")
    brand = relationship("Brand", back_populates="products")
    creator = relationship("User")

    images = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan")
    variants = relationship("ProductVariant", back_populates="product", cascade="all, delete-orphan")
    attributes = relationship("ProductAttribute", back_populates="product", cascade="all, delete-orphan")
