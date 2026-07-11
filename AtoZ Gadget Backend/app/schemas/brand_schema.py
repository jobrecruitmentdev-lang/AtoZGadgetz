from typing import Optional
from datetime import datetime
from pydantic import BaseModel


class BrandCreate(BaseModel):
    name: str
    logo: Optional[str] = None
    status: Optional[str] = "active"


class BrandUpdate(BaseModel):
    name: Optional[str] = None
    logo: Optional[str] = None
    status: Optional[str] = None


class BrandResponse(BaseModel):
    id: int
    name: str
    slug: str
    logo: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
