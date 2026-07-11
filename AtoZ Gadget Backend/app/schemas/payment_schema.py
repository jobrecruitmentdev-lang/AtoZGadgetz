from typing import Optional
from decimal import Decimal
from datetime import datetime
from pydantic import BaseModel, field_validator


class PaymentCreateRequest(BaseModel):
    order_id: int
    payment_method: str  # "COD" or "Online"

    @field_validator("payment_method")
    @classmethod
    def validate_payment_method(cls, v: str) -> str:
        if v not in ["COD", "Online"]:
            raise ValueError("payment_method must be either 'COD' or 'Online'")
        return v


class PaymentCallbackRequest(BaseModel):
    transaction_id: str
    payment_status: str  # "paid" or "failed"
    gateway_response: Optional[str] = None

    @field_validator("payment_status")
    @classmethod
    def validate_payment_status(cls, v: str) -> str:
        if v not in ["paid", "failed"]:
            raise ValueError("payment_status must be either 'paid' or 'failed'")
        return v


class PaymentResponse(BaseModel):
    id: int
    order_id: int
    payment_method: str
    transaction_id: Optional[str] = None
    amount: Decimal
    payment_status: str
    gateway_response: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
