from typing import List
from datetime import datetime
from pydantic import BaseModel

from app.schemas.product_schema import ProductResponse


class WishlistItemResponse(BaseModel):
    id: int
    wishlist_id: int
    product_id: int
    created_at: datetime
    product: ProductResponse

    class Config:
        from_attributes = True


class WishlistResponse(BaseModel):
    id: int
    user_id: int
    created_at: datetime
    items: List[WishlistItemResponse] = []

    class Config:
        from_attributes = True
