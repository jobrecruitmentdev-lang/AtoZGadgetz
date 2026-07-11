from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional, List

from app.models.session import UserSession


class SessionService:
    def create_user_session(
        self,
        db: Session,
        user_id: int,
        refresh_token: str,
        expires_at: datetime,
        device_name: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> UserSession:
        # Inactivate previous sessions from same user_agent/device if desired, or keep multiple
        db_sess = UserSession(
            user_id=user_id,
            device_name=device_name or "Unknown Device",
            ip_address=ip_address,
            user_agent=user_agent,
            refresh_token=refresh_token,
            expires_at=expires_at,
            is_active=True
        )
        db.add(db_sess)
        db.commit()
        db.refresh(db_sess)
        return db_sess

    def rotate_session(
        self,
        db: Session,
        old_refresh_token: str,
        new_refresh_token: str,
        new_expires_at: datetime
    ) -> Optional[UserSession]:
        session = db.query(UserSession).filter(
            UserSession.refresh_token == old_refresh_token,
            UserSession.is_active == True
        ).first()

        if not session:
            return None

        # Rotate token
        session.refresh_token = new_refresh_token
        session.expires_at = new_expires_at
        db.commit()
        db.refresh(session)
        return session

    def deactivate_session(self, db: Session, session_id: int) -> bool:
        session = db.query(UserSession).filter(UserSession.id == session_id).first()
        if not session:
            return False
        session.is_active = False
        db.commit()
        return True

    def deactivate_by_token(self, db: Session, refresh_token: str) -> bool:
        session = db.query(UserSession).filter(
            UserSession.refresh_token == refresh_token,
            UserSession.is_active == True
        ).first()
        if not session:
            return False
        session.is_active = False
        db.commit()
        return True

    def deactivate_all_user_sessions(self, db: Session, user_id: int) -> int:
        sessions = db.query(UserSession).filter(
            UserSession.user_id == user_id,
            UserSession.is_active == True
        ).all()
        count = len(sessions)
        for s in sessions:
            s.is_active = False
        db.commit()
        return count

    def get_user_sessions(self, db: Session, user_id: int) -> List[UserSession]:
        return db.query(UserSession).filter(
            UserSession.user_id == user_id,
            UserSession.is_active == True
        ).order_by(UserSession.created_at.desc()).all()


session_service = SessionService()
