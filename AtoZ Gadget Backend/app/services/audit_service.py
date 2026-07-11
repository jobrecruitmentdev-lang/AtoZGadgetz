import json
from typing import Optional
from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog


class AuditService:
    def log_activity(
        self,
        db: Session,
        user_id: Optional[int],
        module: str,
        action: str,
        description: str,
        old_data: Optional[dict] = None,
        new_data: Optional[dict] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> AuditLog:
        old_str = json.dumps(old_data) if old_data is not None else None
        new_str = json.dumps(new_data) if new_data is not None else None

        db_log = AuditLog(
            user_id=user_id,
            module=module,
            action=action,
            description=description,
            old_data=old_str,
            new_data=new_str,
            ip_address=ip_address,
            user_agent=user_agent
        )
        db.add(db_log)
        db.commit()
        db.refresh(db_log)
        return db_log


audit_service = AuditService()
