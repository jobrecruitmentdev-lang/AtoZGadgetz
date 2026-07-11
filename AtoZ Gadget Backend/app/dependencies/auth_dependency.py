from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from jose import jwt, JWTError

from app.database.connection import get_db
from app.config.settings import settings
from app.models.user import User
from app.models.permission import Permission
from app.models.role_permission import RolePermission

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    token = credentials.credentials

    from app.utils.blacklist import is_token_blacklisted
    if is_token_blacklisted(token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has been revoked or logged out"
        )

    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        user_id = payload.get("user_id")
        token_type = payload.get("type")

        if user_id is None or token_type != "access":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

    user = db.query(User).filter(User.id == int(user_id)).first()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )

    return user


def require_permission(permission_name: str):
    def dependency(
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
    ) -> User:
        # Super Admin bypass (role_id = 1)
        if current_user.role_id == 1:
            return current_user

        # Query permission associated with current user's role
        has_perm = db.query(RolePermission).join(
            Permission, Permission.id == RolePermission.permission_id
        ).filter(
            RolePermission.role_id == current_user.role_id,
            Permission.permission_name == permission_name
        ).first()

        if not has_perm:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Permission denied"
            )

        return current_user
    return dependency


def require_admin_or_super_admin(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Dependency that enforces role-based security:
    Allows Super Admin (role_id = 1) and Admin (role_id = 2) roles, blocks Customers.
    """
    if current_user.role_id not in [1, 2]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission denied. Admin access required."
        )
    return current_user


def get_optional_user(
    db: Session = Depends(get_db)
):
    """
    Optional authentication dependency.
    Returns the current user if a valid Bearer token is provided, else returns None.
    Use this for public endpoints that behave differently for authenticated users.
    """
    from fastapi import Request
    from fastapi.security import HTTPBearer
    # We can't use HTTPBearer directly as optional here without extra wiring,
    # so this returns None — override in routes that need optional auth.
    return None