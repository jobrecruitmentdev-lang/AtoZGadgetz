from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Request, BackgroundTasks
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session
from typing import List

from app.database.connection import get_db
from app.models.refresh_token import RefreshToken
from app.schemas.user_schema import UserRegister
from app.schemas.auth_schema import UserLogin, TokenRefreshRequest, TokenResponse
from app.schemas.session_schema import UserSessionResponse
from app.utils.security import hash_password, verify_password
from app.services.auth_service import create_access_token, create_refresh_token
from app.dependencies.auth_dependency import get_current_user
from app.repositories.user_repository import user_repository
from app.services.session_service import session_service
from app.services.audit_service import audit_service
from app.config.settings import settings
from app.utils.blacklist import blacklist_token

router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)

security_bearer = HTTPBearer()


from app.tasks.background_tasks import bg_send_welcome_email

@router.post("/register")
def register_user(
    user_in: UserRegister,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    if user_repository.get_by_email(db, user_in.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    if user_repository.get_by_mobile(db, user_in.mobile):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mobile number already registered"
        )

    new_user_data = {
        "role_id": 3,
        "first_name": user_in.first_name,
        "last_name": user_in.last_name,
        "email": user_in.email,
        "mobile": user_in.mobile,
        "password_hash": hash_password(user_in.password),
        "profile_image": user_in.profile_image,
        "is_active": True
    }

    new_user = user_repository.create(db, new_user_data)

    background_tasks.add_task(
        bg_send_welcome_email,
        new_user.email,
        f"{new_user.first_name} {new_user.last_name}"
    )

    return {
        "success": True,
        "message": "User registered successfully",
        "data": {
            "user_id": new_user.id
        }
    }


@router.post("/login")
def login_user(
    credentials: UserLogin,
    request: Request,
    db: Session = Depends(get_db)
):
    db_user = user_repository.get_by_email(db, credentials.email)

    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    if not verify_password(credentials.password, db_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid password"
        )

    if not db_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )

    jwt_data = {
        "user_id": db_user.id,
        "role_id": db_user.role_id
    }

    access_token = create_access_token(jwt_data)
    refresh_token = create_refresh_token(jwt_data)

    # Save to standard RefreshToken table (legacy compatibility)
    refresh_token_data = RefreshToken(
        user_id=db_user.id,
        token=refresh_token,
        expires_at=datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
        is_revoked=False
    )
    db.add(refresh_token_data)
    db.commit()  # Persist refresh token record

    # Save to active sessions table
    ip_addr = request.client.host if request.client else "Unknown IP"
    user_agent = request.headers.get("user-agent", "Unknown UA")
    
    session_service.create_user_session(
        db,
        user_id=db_user.id,
        refresh_token=refresh_token,
        expires_at=datetime.now() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
        device_name=None,
        ip_address=ip_addr,
        user_agent=user_agent
    )

    # Log audit trail
    audit_service.log_activity(
        db,
        user_id=db_user.id,
        module="Auth",
        action="Login",
        description=f"User {db_user.email} logged in successfully",
        ip_address=ip_addr
    )

    return {
        "success": True,
        "message": "Login successful",
        "data": {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
        }
    }


@router.post("/refresh")
def refresh_token(
    req: TokenRefreshRequest,
    db: Session = Depends(get_db)
):
    from jose import jwt, JWTError
    try:
        payload = jwt.decode(req.refresh_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = payload.get("user_id")
        token_type = payload.get("type")
        if user_id is None or token_type != "refresh":
            raise HTTPException(status_code=401, detail="Invalid refresh token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    # Verify session is active
    session = db.query(UserSessionResponse).filter(
        UserSessionResponse.refresh_token == req.refresh_token,
        UserSessionResponse.is_active == True
    ).first()
    # Wait, the table query must refer to UserSession model class, not schema!
    from app.models.session import UserSession
    db_session = db.query(UserSession).filter(
        UserSession.refresh_token == req.refresh_token,
        UserSession.is_active == True,
        UserSession.expires_at > datetime.now()
    ).first()

    if not db_session:
        raise HTTPException(status_code=401, detail="Session expired or inactive")

    db_user = user_repository.get(db, int(user_id))
    if not db_user or not db_user.is_active:
        raise HTTPException(status_code=401, detail="User account is inactive or not found")

    # Generate new tokens
    jwt_data = {
        "user_id": db_user.id,
        "role_id": db_user.role_id
    }
    access_token = create_access_token(jwt_data)
    new_refresh_token = create_refresh_token(jwt_data)

    # Rotate session
    session_service.rotate_session(
        db,
        old_refresh_token=req.refresh_token,
        new_refresh_token=new_refresh_token,
        new_expires_at=datetime.now() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    )

    return {
        "success": True,
        "message": "Tokens rotated successfully",
        "data": {
            "access_token": access_token,
            "refresh_token": new_refresh_token,
            "token_type": "bearer"
        }
    }


@router.post("/logout")
def logout_user(
    req: TokenRefreshRequest,
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Inactivate the session
    session_service.deactivate_by_token(db, req.refresh_token)

    # Blacklist the current access token
    access_token = credentials.credentials
    blacklist_token(access_token, expires_in_seconds=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60)

    # Audit log
    ip_addr = request.client.host if request.client else "Unknown IP"
    audit_service.log_activity(
        db,
        user_id=current_user.id,
        module="Auth",
        action="Logout",
        description="User logged out session successfully",
        ip_address=ip_addr
    )

    return {
        "success": True,
        "message": "Logged out successfully",
        "data": {}
    }


@router.post("/logout-all")
def logout_all_devices(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Inactivate all active user sessions
    session_service.deactivate_all_user_sessions(db, current_user.id)

    # Blacklist the current access token
    access_token = credentials.credentials
    blacklist_token(access_token, expires_in_seconds=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60)

    # Audit log
    ip_addr = request.client.host if request.client else "Unknown IP"
    audit_service.log_activity(
        db,
        user_id=current_user.id,
        module="Auth",
        action="Logout All",
        description="User logged out from all devices",
        ip_address=ip_addr
    )

    return {
        "success": True,
        "message": "Logged out from all devices successfully",
        "data": {}
    }


@router.get("/sessions", response_model=None)
def get_active_sessions(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    sessions = session_service.get_user_sessions(db, current_user.id)
    return {
        "success": True,
        "message": "Active sessions retrieved successfully",
        "data": [UserSessionResponse.model_validate(s).model_dump() for s in sessions]
    }


@router.delete("/session/{id}")
def terminate_session(
    id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    from app.models.session import UserSession
    session = db.query(UserSession).filter(
        UserSession.id == id,
        UserSession.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Active session not found")

    session_service.deactivate_session(db, id)

    # Blacklist that session's refresh token if desired
    return {
        "success": True,
        "message": "Session terminated successfully",
        "data": {}
    }


@router.get("/me")
def get_my_profile(
    current_user = Depends(get_current_user)
):
    return {
        "success": True,
        "message": "Profile retrieved successfully",
        "data": {
            "id": current_user.id,
            "first_name": current_user.first_name,
            "last_name": current_user.last_name,
            "email": current_user.email,
            "mobile": current_user.mobile,
            "role_id": current_user.role_id,
            "is_active": current_user.is_active,
            "profile_image": current_user.profile_image
        }
    }