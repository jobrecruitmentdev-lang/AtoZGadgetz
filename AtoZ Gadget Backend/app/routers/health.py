"""
Health Check & Metrics Router
==============================
Endpoints:
  GET /api/health    - Comprehensive service health check
  GET /api/metrics   - Prometheus metrics (text format)
"""
import os
import time
from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.database.connection import get_db

router = APIRouter(tags=["Health & Monitoring"])


# ─────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────
def _check_db(db: Session) -> dict:
    try:
        start = time.time()
        db.execute(text("SELECT 1"))
        latency = round((time.time() - start) * 1000, 2)
        return {"status": "healthy", "latency_ms": latency}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}


def _check_redis() -> dict:
    try:
        import redis
        url = os.getenv("REDIS_URL", "redis://localhost:6379")
        r = redis.from_url(url, socket_connect_timeout=2)
        start = time.time()
        r.ping()
        latency = round((time.time() - start) * 1000, 2)
        return {"status": "healthy", "latency_ms": latency}
    except ImportError:
        return {"status": "not_installed"}
    except Exception as e:
        return {"status": "unavailable", "error": str(e)}


def _check_elasticsearch() -> dict:
    try:
        from elasticsearch import Elasticsearch
        url = os.getenv("ELASTICSEARCH_URL", "http://localhost:9200")
        es = Elasticsearch(url, request_timeout=3)
        start = time.time()
        alive = es.ping()
        latency = round((time.time() - start) * 1000, 2)
        if alive:
            return {"status": "healthy", "latency_ms": latency}
        return {"status": "unavailable"}
    except ImportError:
        return {"status": "not_installed"}
    except Exception as e:
        return {"status": "unavailable", "error": str(e)}


# ─────────────────────────────────────────────
# HEALTH CHECK
# ─────────────────────────────────────────────
@router.get("/api/health", summary="Comprehensive health check")
def health_check(db: Session = Depends(get_db)):
    """
    Returns health status of all services:
    - Database (MySQL)
    - Cache (Redis)
    - Search (Elasticsearch)
    - Application
    
    Overall status is 'healthy' only if all critical services are healthy.
    """
    db_status = _check_db(db)
    redis_status = _check_redis()
    es_status = _check_elasticsearch()

    # Critical: DB must be healthy
    overall = "healthy" if db_status["status"] == "healthy" else "degraded"

    return {
        "success": True,
        "message": "Health check",
        "data": {
            "status": overall,
            "timestamp": datetime.utcnow().isoformat(),
            "version": "7.0.0",
            "environment": os.getenv("APP_ENV", "development"),
            "services": {
                "database":       db_status,
                "redis":          redis_status,
                "elasticsearch":  es_status,
            }
        }
    }


# ─────────────────────────────────────────────
# PROMETHEUS METRICS
# ─────────────────────────────────────────────
@router.get(
    "/api/metrics",
    summary="Prometheus metrics endpoint",
    include_in_schema=False,
)
def metrics():
    """
    Expose Prometheus metrics.
    If prometheus-fastapi-instrumentator is installed and configured,
    this will return the standard /metrics output.
    Otherwise returns a helpful message.
    """
    try:
        from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
        from fastapi.responses import Response
        return Response(
            content=generate_latest(),
            media_type=CONTENT_TYPE_LATEST,
        )
    except ImportError:
        return {
            "message": "Prometheus client not installed. Run: pip install prometheus-fastapi-instrumentator"
        }
