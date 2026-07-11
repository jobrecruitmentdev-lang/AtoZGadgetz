"""
API Gateway
===========
Lightweight reverse-proxy gateway that sits in front of the backend.
Port: 8080 (backend runs on 8000)

Responsibilities:
  - Request routing to backend services
  - Gateway-level rate limiting (before requests hit the backend)
  - Auth token pre-validation (JWT decode without DB lookup)
  - Request/response logging
  - Service discovery (for future microservice extraction)

Run:
  uvicorn gateway.main:app --port 8080 --reload
"""
import os
import time
import logging
from fastapi import FastAPI, Request, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from gateway.middleware.rate_limiter import GatewayRateLimiter
from gateway.middleware.auth_verify import GatewayAuthVerifier
from gateway.routes.proxy import router as proxy_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("gateway")

app = FastAPI(
    title="AtoZ Gadgets API Gateway",
    version="7.0.0",
    description="Enterprise API Gateway — routes traffic to backend microservices",
    docs_url="/gateway/docs",
    redoc_url=None,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Gateway-level rate limiter (stricter than backend)
app.add_middleware(GatewayRateLimiter)

# Gateway-level auth pre-check (optional — backend still validates fully)
app.add_middleware(GatewayAuthVerifier)

# Proxy router (forwards all /api/* to backend)
app.include_router(proxy_router)


@app.get("/gateway/health")
def gateway_health():
    return {
        "success": True,
        "service": "api-gateway",
        "status": "healthy",
        "backend": os.getenv("BACKEND_URL", "http://localhost:8000"),
    }


@app.get("/")
def root():
    return {
        "success": True,
        "message": "AtoZ Gadgets API Gateway v7.0.0",
        "docs": "/gateway/docs",
        "health": "/gateway/health",
    }
