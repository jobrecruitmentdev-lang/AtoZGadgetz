from typing import List, Optional
from decimal import Decimal
from datetime import datetime
from pydantic import BaseModel, field_validator


class OfferCreate(BaseModel):
    name: str
    description: Optional[str] = None
    offer_type: str  # "Product", "Category", "Cart", "Festival"
    discount_type: str  # "Percentage", "Flat"
    discount_value: Decimal
    minimum_order_amount: Optional[Decimal] = Decimal("0.00")
    maximum_discount: Optional[Decimal] = None
    start_date: datetime
    end_date: datetime
    status: Optional[str] = "active"
    
    product_ids: Optional[List[int]] = []
    category_ids: Optional[List[int]] = []

    @field_validator("offer_type")
    @classmethod
    def validate_offer_type(cls, v: str) -> str:
        allowed = ["Product", "Category", "Cart", "Festival"]
        if v not in allowed:
            raise ValueError(f"offer_type must be one of: {', '.join(allowed)}")
        return v

    @field_validator("discount_type")
    @classmethod
    def validate_discount_type(cls, v: str) -> str:
        if v not in ["Percentage", "Flat"]:
            raise ValueError("discount_type must be either 'Percentage' or 'Flat'")
        return v


class OfferResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    offer_type: str
    discount_type: str
    discount_value: Decimal
    minimum_order_amount: Decimal
    maximum_discount: Optional[Decimal] = None
    start_date: datetime
    end_date: datetime
    status: str
    created_at: datetime
    updated_at: datetime
    
    product_ids: List[int] = []
    category_ids: List[int] = []

    class Config:
        from_attributes = True
