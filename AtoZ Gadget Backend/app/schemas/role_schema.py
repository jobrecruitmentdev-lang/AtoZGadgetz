from typing import Optional
from pydantic import BaseModel


class RoleCreate(BaseModel):
    role_name: str
    description: Optional[str] = None


class RoleResponse(BaseModel):
    id: int
    role_name: str
    description: Optional[str] = None

    class Config:
        from_attributes = True
