"""
Gateway Rate Limiter Middleware
===============================
Per-IP sliding window rate limiter at the gateway level.
This is more aggressive than the backend rate limiter and provides
the first line of defence against DDoS / abuse.

Default: 200 requests per minute per IP.
Can be overridden via GATEWAY_RATE_LIMIT env var.
"""
import os
import time
import logging
from collections import defaultdict
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from fastapi import Request

logger = logging.getLogger("gateway.rate_limiter")

RATE_LIMIT = int(os.getenv("GATEWAY_RATE_LIMIT", "200"))  # requests per minute
WINDOW = 60  # seconds

# { ip: [timestamps...] }
_request_log: dict = defaultdict(list)


class GatewayRateLimiter(BaseHTTPMiddleware):

    async def dispatch(self, request: Request, call_next):
        ip = self._get_ip(request)
        now = time.time()

        # Sliding window
        window_start = now - WINDOW
        timestamps = _request_log[ip]
        timestamps[:] = [t for t in timestamps if t > window_start]
        timestamps.append(now)
        _request_log[ip] = timestamps

        if len(timestamps) > RATE_LIMIT:
            logger.warning("Gateway rate limit exceeded: %s (%d req/min)", ip, len(timestamps))
            return JSONResponse(
                {
                    "success": False,
                    "message": f"Rate limit exceeded. Max {RATE_LIMIT} requests per minute.",
                    "retry_after": WINDOW,
                },
                status_code=429,
                headers={"Retry-After": str(WINDOW)},
            )

        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(RATE_LIMIT)
        response.headers["X-RateLimit-Remaining"] = str(max(0, RATE_LIMIT - len(timestamps)))
        return response

    def _get_ip(self, request: Request) -> str:
        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "unknown"
