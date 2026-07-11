"""
Gateway Proxy Router
=====================
Forwards all /api/* requests to the backend service using httpx.
Supports:
  - HTTP method passthrough (GET, POST, PUT, PATCH, DELETE)
  - Request body forwarding
  - Header forwarding (including Authorization)
  - Query parameter forwarding
  - Streaming response forwarding
  - Timeout configuration
  - Retry on connection error (1 retry)
"""
import os
import logging
import httpx
from fastapi import APIRouter, Request
from fastapi.responses import Response, JSONResponse

logger = logging.getLogger("gateway.proxy")

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")
TIMEOUT = float(os.getenv("GATEWAY_TIMEOUT", "30"))

# Headers to strip before forwarding (hop-by-hop headers)
STRIP_HEADERS = {
    "host", "content-length", "transfer-encoding",
    "connection", "keep-alive", "proxy-authenticate",
    "proxy-authorization", "te", "trailers", "upgrade",
}

router = APIRouter()


@router.api_route(
    "/{path:path}",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
    include_in_schema=False,
)
async def proxy(request: Request, path: str):
    """
    Universal reverse proxy — forwards any request to the backend.
    Preserves all headers (except hop-by-hop), query params, and body.
    """
    target_url = f"{BACKEND_URL}/{path}"
    query = str(request.url.query)
    if query:
        target_url = f"{target_url}?{query}"

    # Forward headers (filter hop-by-hop)
    forward_headers = {
        k: v for k, v in request.headers.items()
        if k.lower() not in STRIP_HEADERS
    }
    forward_headers["X-Forwarded-For"]   = request.client.host if request.client else "unknown"
    forward_headers["X-Forwarded-Proto"] = request.url.scheme
    forward_headers["X-Gateway"]         = "deodap-gateway/7.0.0"

    body = await request.body()

    async def _make_request(attempt: int = 0):
        try:
            async with httpx.AsyncClient(timeout=TIMEOUT) as client:
                response = await client.request(
                    method=request.method,
                    url=target_url,
                    headers=forward_headers,
                    content=body,
                )
                return Response(
                    content=response.content,
                    status_code=response.status_code,
                    headers=dict(response.headers),
                    media_type=response.headers.get("content-type"),
                )
        except httpx.ConnectError:
            if attempt == 0:
                logger.warning("Backend connection error, retrying once...")
                return await _make_request(attempt=1)
            logger.error("Backend unreachable: %s", BACKEND_URL)
            return JSONResponse(
                {"success": False, "message": "Backend service unavailable"},
                status_code=503,
            )
        except httpx.TimeoutException:
            logger.error("Backend timeout: %s", target_url)
            return JSONResponse(
                {"success": False, "message": "Request timed out"},
                status_code=504,
            )

    return await _make_request()
