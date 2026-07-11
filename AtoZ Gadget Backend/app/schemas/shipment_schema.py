from typing import Optional
from datetime import datetime
from pydantic import BaseModel, field_validator


class ShipmentCreateRequest(BaseModel):
    order_id: int
    courier_name: str
    tracking_number: str


class ShipmentStatusUpdateRequest(BaseModel):
    shipping_status: str  # "ready", "picked", "shipped", "in_transit", "delivered"

    @field_validator("shipping_status")
    @classmethod
    def validate_shipping_status(cls, v: str) -> str:
        allowed = ["ready", "picked", "shipped", "in_transit", "delivered"]
        if v not in allowed:
            raise ValueError(f"shipping_status must be one of: {', '.join(allowed)}")
        return v


class ShipmentResponse(BaseModel):
    id: int
    order_id: int
    courier_name: Optional[str] = None
    tracking_number: Optional[str] = None
    shipping_status: str
    shipped_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True
