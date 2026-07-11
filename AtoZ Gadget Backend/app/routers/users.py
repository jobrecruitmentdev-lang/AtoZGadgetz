import math
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.dependencies.auth_dependency import require_permission
from app.repositories.user_repository import user_repository
from app.repositories.role_repository import role_repository
from app.schemas.user_schema import UserCreate, UserUpdate, UserResponse
from app.utils.security import hash_password

router = APIRouter(
    prefix="/api/users",
    tags=["User Management"]
)


@router.get("")
def get_users(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    role_id: Optional[int] = Query(None),
    is_active: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
    _ = Depends(require_permission("user.read"))
):
    skip = (page - 1) * size
    users, total = user_repository.get_users_paginated(
        db, skip=skip, limit=size, search=search, role_id=role_id, is_active=is_active
    )

    pages = math.ceil(total / size) if total > 0 else 0

    items = [UserResponse.model_validate(user).model_dump() for user in users]

    return {
        "status": True,
        "message": "Users retrieved successfully",
        "data": {
            "items": items,
            "total": total,
            "page": page,
            "size": size,
            "pages": pages
        }
    }


@router.get("/{id}")
def get_user_by_id(
    id: int,
    db: Session = Depends(get_db),
    _ = Depends(require_permission("user.read"))
):
    user = user_repository.get(db, id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return {
        "status": True,
        "message": "User retrieved successfully",
        "data": UserResponse.model_validate(user).model_dump()
    }


@router.post("")
def create_user(
    user_in: UserCreate,
    db: Session = Depends(get_db),
    _ = Depends(require_permission("user.create"))
):
    # Check if role exists
    if not role_repository.get(db, user_in.role_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role does not exist"
        )

    # Check email exists
    if user_repository.get_by_email(db, user_in.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Check mobile exists
    if user_repository.get_by_mobile(db, user_in.mobile):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mobile number already registered"
        )

    user_data = user_in.model_dump()
    user_data["password_hash"] = hash_password(user_data.pop("password"))

    new_user = user_repository.create(db, user_data)

    return {
        "status": True,
        "message": "User created successfully",
        "data": UserResponse.model_validate(new_user).model_dump()
    }


@router.put("/{id}")
def update_user(
    id: int,
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    _ = Depends(require_permission("user.update"))
):
    user = user_repository.get(db, id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Validate role if updating
    if user_in.role_id is not None:
        if not role_repository.get(db, user_in.role_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Role does not exist"
            )

    # Validate email uniqueness if changing
    if user_in.email is not None and user_in.email != user.email:
        if user_repository.get_by_email(db, user_in.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

    # Validate mobile uniqueness if changing
    if user_in.mobile is not None and user_in.mobile != user.mobile:
        if user_repository.get_by_mobile(db, user_in.mobile):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Mobile number already registered"
            )

    update_data = user_in.model_dump(exclude_unset=True)
    if "password" in update_data and update_data["password"] is not None:
        update_data["password_hash"] = hash_password(update_data.pop("password"))
    elif "password" in update_data:
        update_data.pop("password")

    updated_user = user_repository.update(db, user, update_data)

    return {
        "status": True,
        "message": "User updated successfully",
        "data": UserResponse.model_validate(updated_user).model_dump()
    }


@router.delete("/{id}")
def delete_user(
    id: int,
    db: Session = Depends(get_db),
    _ = Depends(require_permission("user.delete"))
):
    user = user_repository.get(db, id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    user_repository.delete(db, id)

    return {
        "status": True,
        "message": "User deleted successfully",
        "data": {}
    }
