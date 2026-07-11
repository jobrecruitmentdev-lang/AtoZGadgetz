from typing import Optional
from sqlalchemy.orm import Session

from app.repositories.base_repository import BaseRepository
from app.models.role import Role


class RoleRepository(BaseRepository[Role]):

    def __init__(self):
        super().__init__(Role)

    def get_by_name(self, db: Session, role_name: str) -> Optional[Role]:
        return db.query(Role).filter(Role.role_name == role_name).first()


role_repository = RoleRepository()
