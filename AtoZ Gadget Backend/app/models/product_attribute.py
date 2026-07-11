from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.database.connection import Base


class ProductAttribute(Base):
    __tablename__ = "product_attributes"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    attribute_id = Column(Integer, ForeignKey("attributes.id", ondelete="CASCADE"), nullable=False)
    value = Column(String(255), nullable=False)

    # Relationships
    product = relationship("Product", back_populates="attributes")
    attribute = relationship("Attribute", back_populates="product_attributes")
