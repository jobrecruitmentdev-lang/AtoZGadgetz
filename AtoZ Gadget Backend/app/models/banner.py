from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func

from app.database.connection import Base


class Banner(Base):
    __tablename__ = "banners"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    image = Column(String(255), nullable=False)  # URL file path
    mobile_image = Column(String(255), nullable=True)  # Mobile optimized image path
    redirect_url = Column(String(255), nullable=True)
    position = Column(String(50), nullable=False)  # "Homepage Slider", "Category Banner", "Product Banner"
    sort_order = Column(Integer, default=0)
    status = Column(String(20), default="active")  # "active" or "inactive"
    
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now(), server_default=func.now())
