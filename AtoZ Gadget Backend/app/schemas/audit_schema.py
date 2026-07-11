from typing import Optional
from datetime import datetime
from pydantic import BaseModel


class AuditUserResponse(BaseModel):
    first_name: str
    last_name: Optional[str] = None
    email: str

    class Config:
        from_attributes = True


class AuditLogResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    module: str
    action: str
    description: str
    old_data: Optional[str] = None
    new_data: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    created_at: datetime
    
    user: Optional[AuditUserResponse] = None

    class Config:
        from_attributes = True
