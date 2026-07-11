from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field


class ReviewUserResponse(BaseModel):
    first_name: str
    last_name: Optional[str] = None

    class Config:
        from_attributes = True


class ReviewCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5, description="Star rating from 1 to 5")
    review: Optional[str] = None


class ReviewResponse(BaseModel):
    id: int
    user_id: int
    product_id: int
    rating: int
    review: Optional[str] = None
    status: str
    created_at: datetime
    user: Optional[ReviewUserResponse] = None

    class Config:
        from_attributes = True
