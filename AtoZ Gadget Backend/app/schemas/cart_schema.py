from typing import List
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field

from app.schemas.product_schema import ProductResponse


class CartAddRequest(BaseModel):
    product_id: int
    quantity: int = Field(1, ge=1)


class CartUpdateRequest(BaseModel):
    quantity: int = Field(..., ge=1)


class CartItemResponse(BaseModel):
    id: int
    cart_id: int
    product_id: int
    quantity: int
    price: Decimal
    created_at: datetime
    product: ProductResponse

    class Config:
        from_attributes = True


class CartResponse(BaseModel):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    items: List[CartItemResponse] = []
    subtotal: Decimal = Decimal("0.00")
    total: Decimal = Decimal("0.00")

    class Config:
        from_attributes = True
