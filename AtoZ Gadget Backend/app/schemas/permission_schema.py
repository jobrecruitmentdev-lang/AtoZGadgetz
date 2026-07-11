from typing import Optional
from pydantic import BaseModel


class PermissionCreate(BaseModel):
    permission_name: str
    description: Optional[str] = None


class PermissionResponse(BaseModel):
    id: int
    permission_name: str
    description: Optional[str] = None

    class Config:
        from_attributes = True
