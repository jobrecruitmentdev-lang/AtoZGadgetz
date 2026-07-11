from typing import List, Optional
from decimal import Decimal
from datetime import datetime
from pydantic import BaseModel


class OrderCreateRequest(BaseModel):
    address_id: int
    coupon_code: Optional[str] = None


class OrderItemResponse(BaseModel):
    id: int
    order_id: int
    product_id: int
    variant_id: Optional[int] = None
    product_name: str
    product_image: Optional[str] = None
    quantity: int
    price: Decimal
    subtotal: Decimal
    created_at: datetime

    class Config:
        from_attributes = True


class OrderStatusHistoryResponse(BaseModel):
    id: int
    order_id: int
    old_status: Optional[str] = None
    new_status: str
    changed_by: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


class OrderResponse(BaseModel):
    id: int
    order_number: str
    user_id: int
    address_id: int
    subtotal: Decimal
    discount_amount: Decimal
    tax_amount: Decimal
    shipping_charge: Decimal
    total_amount: Decimal
    coupon_id: Optional[int] = None
    offer_discount: Decimal = Decimal("0.00")
    payment_status: str
    order_status: str
    created_at: datetime
    updated_at: datetime
    
    items: List[OrderItemResponse] = []
    status_history: List[OrderStatusHistoryResponse] = []

    class Config:
        from_attributes = True
