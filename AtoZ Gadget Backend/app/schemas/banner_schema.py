from typing import Optional
from datetime import datetime
from pydantic import BaseModel


class BannerCreate(BaseModel):
    title: str
    redirect_url: Optional[str] = None
    position: str  # "Homepage Slider", "Category Banner", "Product Banner"
    sort_order: Optional[int] = 0
    status: Optional[str] = "active"
    start_date: datetime
    end_date: datetime


class BannerResponse(BaseModel):
    id: int
    title: str
    image: str
    mobile_image: Optional[str] = None
    redirect_url: Optional[str] = None
    position: str
    sort_order: int
    status: str
    start_date: datetime
    end_date: datetime
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
