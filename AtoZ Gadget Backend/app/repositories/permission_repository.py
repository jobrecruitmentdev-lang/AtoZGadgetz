from typing import Optional
from sqlalchemy.orm import Session

from app.repositories.base_repository import BaseRepository
from app.models.permission import Permission


class PermissionRepository(BaseRepository[Permission]):

    def __init__(self):
        super().__init__(Permission)

    def get_by_name(self, db: Session, permission_name: str) -> Optional[Permission]:
        return db.query(Permission).filter(
            Permission.permission_name == permission_name
        ).first()


permission_repository = PermissionRepository()
