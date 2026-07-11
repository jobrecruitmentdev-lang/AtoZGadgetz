from typing import Optional
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, field_validator


class CouponCreate(BaseModel):
    code: str
    discount_type: str  # "percentage" or "flat"
    discount_value: Decimal
    minimum_order_amount: Optional[Decimal] = Decimal("0.00")
    maximum_discount: Optional[Decimal] = None
    start_date: datetime
    end_date: datetime
    usage_limit: Optional[int] = None
    status: Optional[str] = "active"

    @field_validator("discount_type")
    @classmethod
    def validate_discount_type(cls, v: str) -> str:
        if v not in ["percentage", "flat"]:
            raise ValueError("discount_type must be either 'percentage' or 'flat'")
        return v


class CouponResponse(BaseModel):
    id: int
    code: str
    discount_type: str
    discount_value: Decimal
    minimum_order_amount: Decimal
    maximum_discount: Optional[Decimal] = None
    start_date: datetime
    end_date: datetime
    usage_limit: Optional[int] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class CouponApplyRequest(BaseModel):
    code: str
