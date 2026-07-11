from typing import Optional
from datetime import datetime
from pydantic import BaseModel, field_validator


class AddressCreate(BaseModel):
    full_name: str
    mobile: str
    address_line1: str
    address_line2: Optional[str] = None
    city: str
    state: str
    country: Optional[str] = "India"
    pincode: str
    address_type: Optional[str] = "Home"  # "Home" or "Office"

    @field_validator("mobile")
    @classmethod
    def validate_mobile(cls, v: str) -> str:
        clean_v = v.replace(" ", "").replace("-", "")
        if clean_v.startswith("+"):
            digits_only = clean_v[1:]
        else:
            digits_only = clean_v
        
        if not digits_only.isdigit():
            raise ValueError("Mobile number must contain only digits")
        if len(digits_only) < 10 or len(digits_only) > 15:
            raise ValueError("Mobile number must be between 10 and 15 digits")
        return clean_v


class AddressUpdate(BaseModel):
    full_name: Optional[str] = None
    mobile: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    pincode: Optional[str] = None
    address_type: Optional[str] = None

    @field_validator("mobile")
    @classmethod
    def validate_mobile(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        clean_v = v.replace(" ", "").replace("-", "")
        if clean_v.startswith("+"):
            digits_only = clean_v[1:]
        else:
            digits_only = clean_v
        
        if not digits_only.isdigit():
            raise ValueError("Mobile number must contain only digits")
        if len(digits_only) < 10 or len(digits_only) > 15:
            raise ValueError("Mobile number must be between 10 and 15 digits")
        return clean_v


class AddressResponse(BaseModel):
    id: int
    user_id: int
    full_name: str
    mobile: str
    address_line1: str
    address_line2: Optional[str] = None
    city: str
    state: str
    country: Optional[str] = None
    pincode: str
    address_type: str
    is_default: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
