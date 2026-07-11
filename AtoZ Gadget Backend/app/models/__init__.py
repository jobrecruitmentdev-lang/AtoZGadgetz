from app.models.role import Role
from app.models.user import User
from app.models.permission import Permission
from app.models.role_permission import RolePermission
from app.models.refresh_token import RefreshToken
from app.models.address import UserAddress

# Phase 2 Models
from app.models.category import Category
from app.models.subcategory import SubCategory
from app.models.brand import Brand
from app.models.product import Product
from app.models.product_image import ProductImage
from app.models.product_variant import ProductVariant
from app.models.attribute import Attribute
from app.models.product_attribute import ProductAttribute

# Phase 3 Models
from app.models.wishlist import Wishlist, WishlistItem
from app.models.cart import Cart, CartItem
from app.models.coupon import Coupon
from app.models.review import ProductReview

# Phase 4 Models
from app.models.order import Order, OrderStatusHistory
from app.models.order_item import OrderItem
from app.models.payment import Payment
from app.models.inventory import Inventory, StockMovement
from app.models.shipment import Shipment
from app.models.return_order import ReturnOrder

# Phase 5 Models
from app.models.banner import Banner
from app.models.homepage import HomepageSection, FeaturedProduct
from app.models.offer import Offer, OfferProduct, OfferCategory
from app.models.audit_log import AuditLog

# Phase 6 Models
from app.models.session import UserSession
from app.models.media import MediaFile
from app.models.notification import Notification

# Phase 7 Models
from app.models.user_behaviour import UserBehaviour
from app.models.analytics_event import AnalyticsEvent