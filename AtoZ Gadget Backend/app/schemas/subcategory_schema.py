from typing import Optional
from datetime import datetime
from pydantic import BaseModel

from app.schemas.category_schema import CategoryResponse


class SubCategoryCreate(BaseModel):
    category_id: int
    name: str
    description: Optional[str] = None
    status: Optional[str] = "active"


class SubCategoryUpdate(BaseModel):
    category_id: Optional[int] = None
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None


class SubCategoryResponse(BaseModel):
    id: int
    category_id: int
    name: str
    slug: str
    description: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    category: Optional[CategoryResponse] = None

    class Config:
        from_attributes = True
