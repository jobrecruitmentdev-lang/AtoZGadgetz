from datetime import datetime
from pydantic import BaseModel


class MediaFileResponse(BaseModel):
    id: int
    user_id: int
    file_name: str
    file_path: str
    file_type: str
    file_size: int
    folder: str
    created_at: datetime

    class Config:
        from_attributes = True
