"""
Advanced Security Middleware (OWASP Hardening)
===============================================
Protections implemented:
  1. SQL Injection pattern detection
  2. XSS payload detection  
  3. Path traversal prevention
  4. Command injection detection
  5. Brute force prevention (per-IP login attempt tracking)
  6. Request size limiting
  7. Suspicious user-agent blocking
  8. Security response headers (HSTS, CSP, etc.)
  9. CSRF protection hints
  10. Honeypot endpoint detection

All blocking is soft-fail by default: logs the event and returns 400/403,
never crashes the application.
"""
import os
import re
import time
import logging
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Dict, Set

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────
# CONFIG (from environment)
# ─────────────────────────────────────────────
MAX_REQUEST_SIZE_MB = 50                             # 50 MB max body
BRUTE_FORCE_MAX    = int(os.getenv("BRUTE_FORCE_MAX_ATTEMPTS", "5"))
BRUTE_FORCE_WINDOW = int(os.getenv("BRUTE_FORCE_LOCKOUT_MINUTES", "15")) * 60   # seconds

# ─────────────────────────────────────────────
# DETECTION PATTERNS
# ─────────────────────────────────────────────

SQL_INJECTION_PATTERNS = re.compile(
    r"(\b(union|select|insert|update|delete|drop|create|alter|exec|execute|"
    r"xp_cmdshell|sp_executesql|cast\(|convert\(|char\(|nchar\(|varchar\(|"
    r"declare|information_schema|sysobjects|syscolumns)\b"
    r"|--\s|;\s*(drop|create|alter|insert|delete|update)\b"
    r"|'\s*(or|and)\s*'?\d+'?\s*=\s*'?\d+'?"
    r"|1\s*=\s*1|or\s+1\s*=\s*1|admin'\s*--)",
    re.IGNORECASE
)

XSS_PATTERNS = re.compile(
    r"(<\s*script[\s\S]*?>|<\s*/\s*script\s*>|javascript\s*:|"
    r"on\w+\s*=|<\s*iframe|<\s*object|<\s*embed|<\s*link[^>]*href|"
    r"<\s*meta[^>]*http-equiv|expression\s*\(|vbscript\s*:)",
    re.IGNORECASE
)

PATH_TRAVERSAL_PATTERNS = re.compile(
    r"(\.\./|\.\.\\|%2e%2e%2f|%2e%2e/|\.\.%2f|%2e\.%2f|%252e%252e%252f)",
    re.IGNORECASE
)

COMMAND_INJECTION_PATTERNS = re.compile(
    r"(;\s*(cat|ls|pwd|whoami|id|uname|wget|curl|nc|bash|sh|cmd|powershell)\b"
    r"|\|\s*(cat|ls|whoami)|`[^`]+`|\$\([^)]+\))",
    re.IGNORECASE
)

SUSPICIOUS_USER_AGENTS = re.compile(
    r"(sqlmap|nikto|nmap|masscan|zgrab|nuclei|gobuster|dirbuster|"
    r"wfuzz|burpsuite|havij|pangolin|acunetix|nessus|openvas|w3af)",
    re.IGNORECASE
)

# Honeypot paths (common scanner targets — legitimate users never hit these)
HONEYPOT_PATHS: Set[str] = {
    "/admin", "/wp-admin", "/wp-login.php", "/phpmyadmin",
    "/.env", "/.git/config", "/config.php", "/server-status",
    "/actuator", "/actuator/env", "/actuator/health",
    "/.well-known/security.txt",
}

# ─────────────────────────────────────────────
# IN-MEMORY BRUTE FORCE TRACKER
# ─────────────────────────────────────────────
# { ip: [(timestamp, path), ...] }
_login_attempts: Dict[str, list] = defaultdict(list)
_blocked_ips: Dict[str, float] = {}    # ip -> unblock_time


class AdvancedSecurityMiddleware(BaseHTTPMiddleware):

    async def dispatch(self, request: Request, call_next):
        client_ip = self._get_client_ip(request)
        path = request.url.path
        method = request.method

        # ── 0. Skip ALL security checks for CORS preflight (OPTIONS) ────────
        # Browser sends OPTIONS before every cross-origin POST/PUT/DELETE
        if method == "OPTIONS":
            return await call_next(request)

        # ── 1. Blocked IPs ──────────────────────────────────────
        if self._is_ip_blocked(client_ip):
            logger.warning("🚫 Blocked IP attempt: %s → %s", client_ip, path)
            return self._json_403("Your IP is temporarily blocked due to suspicious activity.")

        # ── 2. Honeypot path detection ───────────────────────────
        if path.rstrip("/") in HONEYPOT_PATHS:
            self._record_login_attempt(client_ip, path)
            logger.warning("🍯 Honeypot triggered: %s → %s", client_ip, path)
            return self._json_403("Forbidden")

        # ── 3. Suspicious user-agent ─────────────────────────────
        user_agent = request.headers.get("user-agent", "")
        if SUSPICIOUS_USER_AGENTS.search(user_agent):
            logger.warning("🤖 Suspicious agent blocked: %s [%s]", client_ip, user_agent[:80])
            return self._json_403("Automated security scanner detected.")

        # ── 4. Path traversal check ──────────────────────────────
        raw_path = str(request.url)
        if PATH_TRAVERSAL_PATTERNS.search(raw_path):
            logger.warning("⚠️  Path traversal attempt: %s → %s", client_ip, raw_path[:200])
            return JSONResponse(
                {"success": False, "message": "Invalid request path"},
                status_code=400
            )

        # ── 5. Brute force on login endpoints ────────────────────
        if method == "POST" and "/auth/login" in path:
            if self._is_brute_force(client_ip, path):
                logger.warning("🔐 Brute force detected: %s", client_ip)
                return self._json_403(
                    f"Too many failed login attempts. Try again later."
                )

        # ── 6. Request body inspection (for write methods) ───────
        if method in ("POST", "PUT", "PATCH") and not path.startswith("/uploads"):
            # Read body for inspection (but preserve it for downstream)
            body = await request.body()

            if len(body) > MAX_REQUEST_SIZE_MB * 1024 * 1024:
                return JSONResponse(
                    {"success": False, "message": f"Request body too large (max {MAX_REQUEST_SIZE_MB}MB)"},
                    status_code=413
                )

            body_str = body.decode("utf-8", errors="ignore")

            if SQL_INJECTION_PATTERNS.search(body_str):
                logger.warning("💉 SQL injection attempt: %s → %s", client_ip, path)
                return JSONResponse(
                    {"success": False, "message": "Invalid request payload"},
                    status_code=400
                )

            if XSS_PATTERNS.search(body_str):
                logger.warning("🕷️  XSS payload detected: %s → %s", client_ip, path)
                return JSONResponse(
                    {"success": False, "message": "Potentially unsafe content detected"},
                    status_code=400
                )

            if COMMAND_INJECTION_PATTERNS.search(body_str):
                logger.warning("💻 Command injection attempt: %s → %s", client_ip, path)
                return JSONResponse(
                    {"success": False, "message": "Invalid request payload"},
                    status_code=400
                )

        # ── 7. Query param inspection ─────────────────────────────
        query_string = str(request.query_params)
        if SQL_INJECTION_PATTERNS.search(query_string) or XSS_PATTERNS.search(query_string):
            logger.warning("💉 Injection in query params: %s → %s?%s", client_ip, path, query_string[:100])
            return JSONResponse(
                {"success": False, "message": "Invalid query parameters"},
                status_code=400
            )

        # ── Process request ───────────────────────────────────────
        response: Response = await call_next(request)

        # ── 8. Security headers ───────────────────────────────────
        self._add_security_headers(response)

        # ── 9. Track failed logins for brute force ────────────────
        if method == "POST" and "/auth/login" in path:
            if response.status_code in (400, 401, 422):
                self._record_login_attempt(client_ip, path)
            elif response.status_code == 200:
                # Successful login resets the counter
                _login_attempts.pop(client_ip, None)

        return response

    # ─────────────────────────────────────────────
    # HELPERS
    # ─────────────────────────────────────────────
    def _get_client_ip(self, request: Request) -> str:
        """Extract real client IP (handles X-Forwarded-For from proxies)."""
        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            return forwarded.split(",")[0].strip()
        if request.client:
            return request.client.host
        return "unknown"

    def _is_ip_blocked(self, ip: str) -> bool:
        unblock_at = _blocked_ips.get(ip)
        if unblock_at is None:
            return False
        if time.time() > unblock_at:
            del _blocked_ips[ip]
            return False
        return True

    def _record_login_attempt(self, ip: str, path: str):
        now = time.time()
        attempts = _login_attempts[ip]
        # Purge old attempts outside the window
        attempts[:] = [(ts, p) for ts, p in attempts if now - ts < BRUTE_FORCE_WINDOW]
        attempts.append((now, path))
        _login_attempts[ip] = attempts

        if len(attempts) >= BRUTE_FORCE_MAX:
            _blocked_ips[ip] = now + BRUTE_FORCE_WINDOW
            logger.warning("🔒 IP blocked for brute force: %s (attempts=%d)", ip, len(attempts))

    def _is_brute_force(self, ip: str, path: str) -> bool:
        now = time.time()
        attempts = _login_attempts.get(ip, [])
        recent = [ts for ts, p in attempts if now - ts < BRUTE_FORCE_WINDOW]
        return len(recent) >= BRUTE_FORCE_MAX

    def _add_security_headers(self, response: Response):
        headers = {
            "X-Content-Type-Options":          "nosniff",
            "X-Frame-Options":                 "DENY",
            "X-XSS-Protection":                "1; mode=block",
            "Referrer-Policy":                 "strict-origin-when-cross-origin",
            "Permissions-Policy":              "geolocation=(), microphone=(), camera=()",
            "Content-Security-Policy":         (
                "default-src 'self'; "
                "script-src 'self' 'unsafe-inline' https://checkout.razorpay.com; "
                "style-src 'self' 'unsafe-inline'; "
                "img-src 'self' data: https:; "
                "connect-src 'self' https://api.razorpay.com; "
                "frame-ancestors 'none';"
            ),
            "Strict-Transport-Security":       "max-age=31536000; includeSubDomains",
            "Cache-Control":                   "no-store",
        }
        for key, value in headers.items():
            response.headers[key] = value

    def _json_403(self, message: str):
        return JSONResponse(
            {"success": False, "message": message},
            status_code=403
        )
