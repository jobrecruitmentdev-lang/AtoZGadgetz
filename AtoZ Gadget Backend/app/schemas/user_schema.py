from typing import Optional, Any
from datetime import datetime
from pydantic import BaseModel, EmailStr, field_validator

from app.schemas.role_schema import RoleResponse


class UserRegister(BaseModel):
    first_name: str
    last_name: Optional[str] = None
    email: EmailStr
    mobile: str
    password: str
    profile_image: Optional[str] = None

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

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(c.islower() for c in v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit")
        special_chars = "!@#$%^&*()-_=+[]{}|;:',.<>?/"
        if not any(c in special_chars for c in v):
            raise ValueError("Password must contain at least one special character")
        return v


class UserCreate(BaseModel):
    role_id: int
    first_name: str
    last_name: Optional[str] = None
    email: EmailStr
    mobile: str
    password: str
    profile_image: Optional[str] = None
    is_active: bool = True

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

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(c.islower() for c in v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit")
        special_chars = "!@#$%^&*()-_=+[]{}|;:',.<>?/"
        if not any(c in special_chars for c in v):
            raise ValueError("Password must contain at least one special character")
        return v


class UserUpdate(BaseModel):
    role_id: Optional[int] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    mobile: Optional[str] = None
    password: Optional[str] = None
    profile_image: Optional[str] = None
    is_active: Optional[bool] = None

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

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(c.islower() for c in v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit")
        special_chars = "!@#$%^&*()-_=+[]{}|;:',.<>?/"
        if not any(c in special_chars for c in v):
            raise ValueError("Password must contain at least one special character")
        return v


class UserResponse(BaseModel):
    id: int
    role_id: int
    first_name: str
    last_name: Optional[str] = None
    email: EmailStr
    mobile: str
    profile_image: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    role: Optional[RoleResponse] = None

    class Config:
        from_attributes = True