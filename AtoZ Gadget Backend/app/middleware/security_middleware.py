import time
import logging
from collections import defaultdict
from typing import Dict, List, Set
from fastapi import Request, Response, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from app.config.settings import settings

logger = logging.getLogger("security")

# Simple IP Blocklist and Rate Limiter store
_blocked_ips: Set[str] = set()
_rate_limit_records: Dict[str, List[float]] = defaultdict(list)

# Load blocked IPs from settings if configured
if hasattr(settings, "BLOCKED_IPS") and settings.BLOCKED_IPS:
    _blocked_ips.update([ip.strip() for ip in settings.BLOCKED_IPS.split(",") if ip.strip()])


class SecurityMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        ip = request.client.host if request.client else "Unknown IP"
        
        # 1. IP Blocklist Check
        if ip in _blocked_ips:
            logger.warning(f"Blocked request attempt from IP: {ip}")
            return JSONResponse(
                status_code=status.HTTP_403_FORBIDDEN,
                content={"success": False, "message": "Access Denied. IP address is blocked."}
            )

        # Skip ALL checks for CORS preflight requests (OPTIONS)
        # OPTIONS is sent automatically by browser before cross-origin requests
        if request.method == "OPTIONS":
            return await call_next(request)

        # 2. Rate Limiting Check (100 requests per minute per IP)
        now = time.time()
        # Clean older records
        _rate_limit_records[ip] = [t for t in _rate_limit_records[ip] if now - t < 60]
        if len(_rate_limit_records[ip]) >= 100:
            logger.warning(f"Rate limit exceeded for IP: {ip}")
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={"success": False, "message": "Too many requests. Please try again later."}
            )
        _rate_limit_records[ip].append(now)

        # 3. Track request details and response time
        start_time = time.time()
        try:
            response = await call_next(request)
        except Exception as e:
            logger.error(f"Error processing request: {str(e)}", exc_info=True)
            # Let global exception handler process it, or wrap it
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={"success": False, "message": f"Internal Server Error: {str(e)}"}
            )

        duration = time.time() - start_time

        # 4. Request Logging
        logger.info(
            f"IP: {ip} - Method: {request.method} - Path: {request.url.path} - "
            f"Status: {response.status_code} - Duration: {duration:.4f}s"
        )

        # 5. Security Headers
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        return response
