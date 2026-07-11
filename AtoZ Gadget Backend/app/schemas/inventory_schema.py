from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field


class InventoryUpdateRequest(BaseModel):
    stock_quantity: int = Field(..., ge=0, description="Absolute new stock value")


class InventoryResponse(BaseModel):
    id: int
    product_id: int
    variant_id: Optional[int] = None
    stock_quantity: int
    reserved_quantity: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class StockMovementResponse(BaseModel):
    id: int
    product_id: int
    type: str  # "purchase", "order", "return", "adjustment"
    quantity: int
    reference_type: Optional[str] = None
    reference_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True
