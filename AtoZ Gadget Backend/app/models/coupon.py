from sqlalchemy import Column, Integer, String, Numeric, DateTime
from sqlalchemy.sql import func

from app.database.connection import Base


class Coupon(Base):
    __tablename__ = "coupons"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False)
    discount_type = Column(String(20), nullable=False)  # "percentage" or "flat"
    discount_value = Column(Numeric(10, 2), nullable=False)
    minimum_order_amount = Column(Numeric(10, 2), default=0.00, nullable=False)
    maximum_discount = Column(Numeric(10, 2), nullable=True)  # Maximum discount cap
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    usage_limit = Column(Integer, nullable=True)  # Total limit of times coupon can be used
    status = Column(String(20), default="active")  # "active" or "inactive"
    created_at = Column(DateTime, server_default=func.now())
