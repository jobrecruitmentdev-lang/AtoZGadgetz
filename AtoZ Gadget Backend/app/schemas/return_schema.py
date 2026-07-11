from datetime import datetime
from pydantic import BaseModel, field_validator


class ReturnCreateRequest(BaseModel):
    reason: str


class ReturnStatusUpdateRequest(BaseModel):
    status: str  # "requested", "approved", "rejected", "completed"

    @field_validator("status")
    @classmethod
    def validate_return_status(cls, v: str) -> str:
        allowed = ["requested", "approved", "rejected", "completed"]
        if v not in allowed:
            raise ValueError(f"status must be one of: {', '.join(allowed)}")
        return v


class ReturnResponse(BaseModel):
    id: int
    order_id: int
    user_id: int
    reason: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
