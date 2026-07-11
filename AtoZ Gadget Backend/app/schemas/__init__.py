from app.schemas.response_schema import APIResponse, ErrorResponse, PaginationData
from app.schemas.role_schema import RoleCreate, RoleResponse
from app.schemas.permission_schema import PermissionCreate, PermissionResponse
from app.schemas.user_schema import UserRegister, UserCreate, UserUpdate, UserResponse
from app.schemas.auth_schema import UserLogin, TokenResponse

# Phase 2 Schemas
from app.schemas.category_schema import CategoryCreate, CategoryUpdate, CategoryResponse
from app.schemas.subcategory_schema import SubCategoryCreate, SubCategoryUpdate, SubCategoryResponse
from app.schemas.brand_schema import BrandCreate, BrandUpdate, BrandResponse
from app.schemas.product_schema import (
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    ProductImageCreate,
    ProductImageResponse,
    ProductVariantCreate,
    ProductVariantResponse,
    AttributeCreate,
    AttributeResponse,
    ProductAttributeCreate,
    ProductAttributeResponse
)

# Phase 3 Schemas
from app.schemas.wishlist_schema import WishlistResponse, WishlistItemResponse
from app.schemas.cart_schema import CartAddRequest, CartUpdateRequest, CartItemResponse, CartResponse
from app.schemas.address_schema import AddressCreate, AddressUpdate, AddressResponse
from app.schemas.coupon_schema import CouponCreate, CouponResponse, CouponApplyRequest
from app.schemas.review_schema import ReviewCreate, ReviewResponse, ReviewUserResponse

# Phase 4 Schemas
from app.schemas.order_schema import OrderCreateRequest, OrderItemResponse, OrderStatusHistoryResponse, OrderResponse
from app.schemas.payment_schema import PaymentCreateRequest, PaymentCallbackRequest, PaymentResponse
from app.schemas.inventory_schema import InventoryUpdateRequest, InventoryResponse, StockMovementResponse
from app.schemas.shipment_schema import ShipmentCreateRequest, ShipmentStatusUpdateRequest, ShipmentResponse
from app.schemas.return_schema import ReturnCreateRequest, ReturnStatusUpdateRequest, ReturnResponse

# Phase 5 Schemas
from app.schemas.dashboard_schema import DashboardMetricsResponse, SalesChartResponse, TopProductItem, RecentOrderItem
from app.schemas.banner_schema import BannerCreate, BannerResponse
from app.schemas.homepage_schema import HomepageSectionCreate, HomepageSectionResponse, FeaturedProductCreate, FeaturedProductResponse
from app.schemas.offer_schema import OfferCreate, OfferResponse
from app.schemas.audit_schema import AuditLogResponse

# Phase 6 Schemas
from app.schemas.session_schema import UserSessionResponse
from app.schemas.media_schema import MediaFileResponse
from app.schemas.notification_schema import NotificationResponse
