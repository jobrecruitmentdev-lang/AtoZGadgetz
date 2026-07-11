from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.repositories.base_repository import BaseRepository
from app.models.user import User


class UserRepository(BaseRepository[User]):

    def __init__(self):
        super().__init__(User)

    def get_by_email(self, db: Session, email: str) -> Optional[User]:
        return db.query(User).filter(User.email == email).first()

    def get_by_mobile(self, db: Session, mobile: str) -> Optional[User]:
        return db.query(User).filter(User.mobile == mobile).first()

    def get_users_paginated(
        self,
        db: Session,
        skip: int = 0,
        limit: int = 10,
        search: Optional[str] = None,
        role_id: Optional[int] = None,
        is_active: Optional[bool] = None
    ) -> Tuple[List[User], int]:
        query = db.query(User)

        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                or_(
                    User.first_name.like(search_pattern),
                    User.last_name.like(search_pattern),
                    User.email.like(search_pattern),
                    User.mobile.like(search_pattern)
                )
            )

        if role_id is not None:
            query = query.filter(User.role_id == role_id)

        if is_active is not None:
            query = query.filter(User.is_active == is_active)

        total = query.count()
        items = query.offset(skip).limit(limit).all()
        return items, total


user_repository = UserRepository()
