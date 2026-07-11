from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, field_validator
from typing import Optional

from app.database.connection import get_db
from app.dependencies.auth_dependency import get_current_user
from app.models.user import User
from app.schemas.user_schema import UserResponse

router = APIRouter(
    prefix="/api/profile",
    tags=["Customer Profile System"]
)


class ProfileUpdateRequest(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    mobile: Optional[str] = None
    profile_image: Optional[str] = None

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


@router.get("")
def get_profile(
    current_user = Depends(get_current_user)
):
    return {
        "success": True,
        "message": "Profile retrieved successfully",
        "data": UserResponse.model_validate(current_user).model_dump()
    }


@router.put("")
def update_profile(
    req: ProfileUpdateRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Fetch active user from database
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Check email duplicate check (not updated here, only name/mobile/image)
    update_data = req.model_dump(exclude_unset=True)
    
    # If mobile is updated, check duplicate in database
    if "mobile" in update_data and update_data["mobile"] != user.mobile:
        dup = db.query(User).filter(User.mobile == update_data["mobile"]).first()
        if dup:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Mobile number already registered by another account"
            )

    for field, value in update_data.items():
        setattr(user, field, value)

    db.commit()
    db.refresh(user)

    return {
        "success": True,
        "message": "Profile updated successfully",
        "data": UserResponse.model_validate(user).model_dump()
    }
