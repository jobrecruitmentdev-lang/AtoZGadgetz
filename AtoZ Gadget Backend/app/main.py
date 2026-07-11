"""
AtoZ Gadgets API — Main Application (Phase 7: Enterprise)
==========================================================
Phase 7 additions:
  - Prometheus metrics middleware
  - Advanced security middleware (OWASP hardening)
  - New routers: recommendations, analytics, payment_gateway, health, search
  - New models: UserBehaviour, AnalyticsEvent
"""
import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.openapi.docs import get_swagger_ui_html, get_redoc_html
from fastapi.responses import HTMLResponse
import swagger_ui_bundle

from app.database.connection import Base, engine

# ── Model Imports (all must be imported for metadata registration) ──────────
from app.models import (
    # Phase 1
    Role, User, Permission, RolePermission, RefreshToken, UserAddress,
    # Phase 2
    Category, SubCategory, Brand, Product, ProductImage, ProductVariant,
    Attribute, ProductAttribute,
    # Phase 3
    Wishlist, WishlistItem, Cart, CartItem, Coupon, ProductReview,
    # Phase 4
    Order, OrderStatusHistory, OrderItem, Payment,
    Inventory, StockMovement, Shipment, ReturnOrder,
    # Phase 5
    Banner, HomepageSection, FeaturedProduct, Offer, OfferProduct, OfferCategory, AuditLog,
    # Phase 6
    UserSession, MediaFile, Notification,
    # Phase 7
    UserBehaviour, AnalyticsEvent,
)

# ── Router Imports ───────────────────────────────────────────────────────────
from app.routers import (
    auth, users, categories, subcategories, brands, products, uploads,
    store, wishlist, cart, address, checkout, coupon, profile, review,
    order, payment, inventory, shipment, return_order,
    admin_dashboard, banner, homepage, offer, report, audit,
    # Phase 6
    media, notification,
    # Phase 7
    search, recommendation, analytics, payment_gateway, health,
)

from app.middleware.error_handler import setup_exception_handlers

# ── Auto-create tables ───────────────────────────────────────────────────────
Base.metadata.create_all(bind=engine)

# ── Ensure uploads directory exists ─────────────────────────────────────────
UPLOAD_DIR = os.path.join("app", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ── FastAPI Application ──────────────────────────────────────────────────────
app = FastAPI(
    title="AtoZ Gadgets API",
    description=(
        "Enterprise-grade e-commerce backend. "
        "Phase 7: Microservice-ready architecture with AI recommendations, "
        "Elasticsearch search, Razorpay payments, analytics engine, and full observability."
    ),
    version="7.0.0",
    docs_url=None,       # Disable default — we serve locally below
    redoc_url=None,      # Disable default — we serve locally below
)

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    from fastapi.openapi.utils import get_openapi
    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )
    # Force OpenAPI 3.0.0 to fix "Unable to render this definition" error in Swagger UI
    openapi_schema["openapi"] = "3.0.0"
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi


# ── Middleware ───────────────────────────────────────────────────────────────
from fastapi.middleware.cors import CORSMiddleware
from app.middleware.security_middleware import SecurityMiddleware
from app.middleware.advanced_security import AdvancedSecurityMiddleware

# CORS (configure allowed origins via env in production)
cors_origins = os.getenv("CORS_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Phase 6: Basic security headers + rate limiting
app.add_middleware(SecurityMiddleware)

# Phase 7: OWASP hardening (SQL injection, XSS, brute force, etc.)
app.add_middleware(AdvancedSecurityMiddleware)

# Phase 7: Prometheus metrics
try:
    from prometheus_fastapi_instrumentator import Instrumentator
    Instrumentator(
        should_group_status_codes=True,
        should_ignore_untemplated=True,
        should_respect_env_var=True,
        should_instrument_requests_inprogress=True,
        excluded_handlers=["/metrics", "/api/health"],
        env_var_name="ENABLE_METRICS",
    ).instrument(app).expose(app, endpoint="/metrics", include_in_schema=False)
except ImportError:
    pass  # Prometheus optional — works without it

# ── Exception Handlers ───────────────────────────────────────────────────────
setup_exception_handlers(app)

# ── Static Files ─────────────────────────────────────────────────────────────
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# ── Local Swagger UI Static Files (no CDN needed) ────────────────────────────
app.mount("/swagger-static", StaticFiles(directory=swagger_ui_bundle.swagger_ui_path), name="swagger-static")


# ── Custom Swagger UI (served locally, no CDN) ───────────────────────────────
@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui() -> HTMLResponse:
    return get_swagger_ui_html(
        openapi_url="/openapi.json",
        title="AtoZ Gadgets API — Swagger UI",
        swagger_js_url="/swagger-static/swagger-ui-bundle.js",
        swagger_css_url="/swagger-static/swagger-ui.css",
    )


@app.get("/redoc", include_in_schema=False)
async def custom_redoc() -> HTMLResponse:
    return get_redoc_html(
        openapi_url="/openapi.json",
        title="AtoZ Gadgets API — ReDoc",
        redoc_js_url="https://cdn.jsdelivr.net/npm/redoc@latest/bundles/redoc.standalone.js",
    )

# ── Phase 1–5 Routers ────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(categories.router)
app.include_router(subcategories.router)
app.include_router(brands.router)
app.include_router(products.router)
app.include_router(uploads.router)
app.include_router(store.router)
app.include_router(wishlist.router)
app.include_router(cart.router)
app.include_router(address.router)
app.include_router(checkout.router)
app.include_router(coupon.router)
app.include_router(profile.router)
app.include_router(review.router)
app.include_router(order.router)
app.include_router(payment.router)
app.include_router(inventory.router)
app.include_router(shipment.router)
app.include_router(return_order.router)
app.include_router(admin_dashboard.router)
app.include_router(banner.router)
app.include_router(homepage.router)
app.include_router(offer.router)
app.include_router(report.router)
app.include_router(audit.router)

# ── Phase 6 Routers ───────────────────────────────────────────────────────────
app.include_router(media.router)
app.include_router(notification.router)

# ── Phase 7 Routers ───────────────────────────────────────────────────────────
app.include_router(search.router)
app.include_router(recommendation.router)
app.include_router(analytics.router)
app.include_router(payment_gateway.router)
app.include_router(health.router)


# ── Root Endpoint ────────────────────────────────────────────────────────────
@app.get("/", include_in_schema=False)
def root():
    return {
        "success": True,
        "message": "AtoZ Gadgets API — Enterprise v7.0.0",
        "docs": "/docs",
        "health": "/api/health",
        "metrics": "/metrics",
    }