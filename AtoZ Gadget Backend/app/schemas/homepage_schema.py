from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

from app.schemas.product_schema import ProductResponse


class FeaturedProductCreate(BaseModel):
    product_id: int
    section_id: int
    sort_order: Optional[int] = 0


class FeaturedProductResponse(BaseModel):
    id: int
    product_id: int
    section_id: int
    sort_order: int
    created_at: datetime
    product: Optional[ProductResponse] = None

    class Config:
        from_attributes = True


class HomepageSectionCreate(BaseModel):
    title: str
    section_type: str  # "Featured Products", "Trending Products", "New Arrivals"
    sort_order: Optional[int] = 0
    status: Optional[str] = "active"


class HomepageSectionResponse(BaseModel):
    id: int
    title: str
    section_type: str
    sort_order: int
    status: str
    created_at: datetime
    updated_at: datetime
    featured_products: List[FeaturedProductResponse] = []

    class Config:
        from_attributes = True
