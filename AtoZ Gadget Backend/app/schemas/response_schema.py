from typing import Generic, TypeVar, Optional, List, Any
from pydantic import BaseModel

T = TypeVar("T")


class APIResponse(BaseModel, Generic[T]):
    success: bool = True
    status: bool = True
    message: str = ""
    data: Optional[T] = None


class ErrorResponse(BaseModel):
    success: bool = False
    status: bool = False
    message: str = ""
    errors: List[Any] = []


class PaginationData(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    size: int
    pages: int
