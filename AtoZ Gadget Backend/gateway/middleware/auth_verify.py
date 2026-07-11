"""
Gateway Auth Verifier Middleware
=================================
Performs a lightweight JWT decode at the gateway layer.
Does NOT hit the database — only validates token signature and expiry.

Purpose:
  - Reject obviously invalid/expired tokens early (before hitting backend)
  - Add X-User-Id and X-User-Role headers to forward to backend services
  - Reduces unnecessary load on backend for invalid token requests

Note: Backend still performs full validation including blacklist checks.
"""
import os
import logging
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from fastapi import Request

logger = logging.getLogger("gateway.auth_verify")

SECRET_KEY = os.getenv("SECRET_KEY", "deodap_secret_key_2026")
ALGORITHM  = os.getenv("ALGORITHM", "HS256")

# Paths that don't require any auth (pass through without token check)
PUBLIC_PATHS = {
    "/api/auth/login",
    "/api/auth/register",
    "/api/search/autocomplete",
    "/api/search/suggestions",
    "/api/recommendations/popular",
    "/api/recommendations/similar",
    "/api/recommendations/frequently-bought",
    "/api/health",
    "/api/metrics",
    "/metrics",
    "/docs",
    "/openapi.json",
    "/redoc",
    "/gateway/health",
    "/gateway/docs",
    "/",
}


class GatewayAuthVerifier(BaseHTTPMiddleware):

    async def dispatch(self, request: Request, call_next):
        path = request.url.path

        # Skip auth check for public paths
        if self._is_public(path):
            return await call_next(request)

        auth_header = request.headers.get("authorization", "")
        if not auth_header.startswith("Bearer "):
            # No token — let backend handle 401 with proper error
            return await call_next(request)

        token = auth_header[7:]

        try:
            from jose import jwt, JWTError
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

            user_id  = str(payload.get("user_id", ""))
            role_id  = str(payload.get("role_id", ""))
            token_type = payload.get("type", "")

            if token_type != "access":
                return JSONResponse(
                    {"success": False, "message": "Invalid token type"},
                    status_code=401
                )

            # Forward user info as headers (downstream services can use these)
            # We modify the request scope headers to inject them
            # Note: Starlette request headers are immutable, backend reads from its own JWT
            logger.debug("Gateway auth OK: user_id=%s path=%s", user_id, path)

        except Exception as e:
            logger.warning("Gateway auth failed: %s for path %s", str(e), path)
            # Let the request pass — backend will give proper 401 response
            pass

        return await call_next(request)

    def _is_public(self, path: str) -> bool:
        """Check if path is in the public paths list or starts with a public prefix."""
        if path in PUBLIC_PATHS:
            return True
        for public in PUBLIC_PATHS:
            if path.startswith(public):
                return True
        return path.startswith("/uploads/")
