from typing import Optional
from datetime import datetime
from pydantic import BaseModel


class UserSessionResponse(BaseModel):
    id: int
    user_id: int
    device_name: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    expires_at: datetime
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
