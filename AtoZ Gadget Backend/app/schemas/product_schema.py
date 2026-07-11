from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field, AliasChoices

from app.schemas.category_schema import CategoryResponse
from app.schemas.subcategory_schema import SubCategoryResponse
from app.schemas.brand_schema import BrandResponse


# --- Attribute Schemas ---
class AttributeCreate(BaseModel):
    name: str


class AttributeResponse(BaseModel):
    id: int
    name: str
    created_at: datetime

    class Config:
        from_attributes = True


# --- Product Attribute Schemas ---
class ProductAttributeCreate(BaseModel):
    attribute_id: Optional[int] = None
    attribute_name: Optional[str] = None
    value: str


class ProductAttributeResponse(BaseModel):
    id: int
    product_id: int
    attribute_id: int
    value: str
    attribute: Optional[AttributeResponse] = None

    class Config:
        from_attributes = True


# --- Product Image Schemas ---
class ProductImageCreate(BaseModel):
    image: str
    alt_text: Optional[str] = None
    sort_order: Optional[int] = 0


class ProductImageResponse(BaseModel):
    id: int
    product_id: int
    image: str
    alt_text: Optional[str] = None
    sort_order: int
    created_at: datetime

    class Config:
        from_attributes = True


# --- Product Variant Schemas ---
class ProductVariantCreate(BaseModel):
    variant_name: str
    variant_value: str
    additional_price: Optional[Decimal] = Decimal("0.00")
    stock: Optional[int] = 0


class ProductVariantResponse(BaseModel):
    id: int
    product_id: int
    variant_name: str
    variant_value: str
    additional_price: Decimal
    stock: int
    created_at: datetime

    class Config:
        from_attributes = True


# --- Main Product Schemas ---
class ProductCreate(BaseModel):
    category_id: int
    subcategory_id: int
    brand_id: Optional[int] = None
    name: str
    short_description: Optional[str] = None
    description: Optional[str] = None
    sku: str
    barcode: Optional[str] = None
    price: Decimal
    discount_price: Optional[Decimal] = None
    tax_percentage: Optional[Decimal] = Decimal("0.00")
    stock_quantity: Optional[int] = 0
    weight: Optional[float] = None
    length: Optional[float] = None
    width: Optional[float] = None
    height: Optional[float] = None
    thumbnail_image: Optional[str] = None
    status: Optional[str] = "active"
    is_featured: Optional[bool] = False
    is_active: Optional[bool] = True

    # Extended Inventory & Shopify Integration Fields
    handle: Optional[str] = Field(default=None, validation_alias=AliasChoices("handle", "Handle"))
    title: Optional[str] = Field(default=None, validation_alias=AliasChoices("title", "Title"))
    option1_name: Optional[str] = Field(default=None, validation_alias=AliasChoices("option1_name", "Option1 Name"))
    option2_name: Optional[str] = Field(default=None, validation_alias=AliasChoices("option2_name", "Option2 Name"))
    option3_name: Optional[str] = Field(default=None, validation_alias=AliasChoices("option3_name", "Option3 Name"))
    hs_code: Optional[str] = Field(default=None, validation_alias=AliasChoices("hs_code", "HS Code"))
    country_of_origin: Optional[str] = Field(default=None, validation_alias=AliasChoices("country_of_origin", "country of orgin", "country of origin"))
    location: Optional[str] = Field(default=None, validation_alias=AliasChoices("location", "Location"))
    bin_name: Optional[str] = Field(default=None, validation_alias=AliasChoices("bin_name", "bin name", "Bin Name"))
    incoming: Optional[int] = Field(default=0, validation_alias=AliasChoices("incoming", "Incoming"))
    unavailable: Optional[int] = Field(default=0, validation_alias=AliasChoices("unavailable", "Unavailable"))
    committed: Optional[int] = Field(default=0, validation_alias=AliasChoices("committed", "comitted", "Committed", "Comitted"))
    available: Optional[int] = Field(default=0, validation_alias=AliasChoices("available", "Available"))
    onhand_old: Optional[int] = Field(default=0, validation_alias=AliasChoices("onhand_old", "onhand(old)", "onhand(old"))
    onhand_new: Optional[int] = Field(default=0, validation_alias=AliasChoices("onhand_new", "onhand(new)", "onhand(new)"))

    class Config:
        populate_by_name = True


class ProductUpdate(BaseModel):
    category_id: Optional[int] = None
    subcategory_id: Optional[int] = None
    brand_id: Optional[int] = None
    name: Optional[str] = None
    short_description: Optional[str] = None
    description: Optional[str] = None
    sku: Optional[str] = None
    barcode: Optional[str] = None
    price: Optional[Decimal] = None
    discount_price: Optional[Decimal] = None
    tax_percentage: Optional[Decimal] = None
    stock_quantity: Optional[int] = None
    weight: Optional[float] = None
    length: Optional[float] = None
    width: Optional[float] = None
    height: Optional[float] = None
    thumbnail_image: Optional[str] = None
    status: Optional[str] = None
    is_featured: Optional[bool] = None
    is_active: Optional[bool] = None

    # Extended Inventory & Shopify Integration Fields (Optional for Updates)
    handle: Optional[str] = Field(default=None, validation_alias=AliasChoices("handle", "Handle"))
    title: Optional[str] = Field(default=None, validation_alias=AliasChoices("title", "Title"))
    option1_name: Optional[str] = Field(default=None, validation_alias=AliasChoices("option1_name", "Option1 Name"))
    option2_name: Optional[str] = Field(default=None, validation_alias=AliasChoices("option2_name", "Option2 Name"))
    option3_name: Optional[str] = Field(default=None, validation_alias=AliasChoices("option3_name", "Option3 Name"))
    hs_code: Optional[str] = Field(default=None, validation_alias=AliasChoices("hs_code", "HS Code"))
    country_of_origin: Optional[str] = Field(default=None, validation_alias=AliasChoices("country_of_origin", "country of orgin", "country of origin"))
    location: Optional[str] = Field(default=None, validation_alias=AliasChoices("location", "Location"))
    bin_name: Optional[str] = Field(default=None, validation_alias=AliasChoices("bin_name", "bin name", "Bin Name"))
    incoming: Optional[int] = Field(default=None, validation_alias=AliasChoices("incoming", "Incoming"))
    unavailable: Optional[int] = Field(default=None, validation_alias=AliasChoices("unavailable", "Unavailable"))
    committed: Optional[int] = Field(default=None, validation_alias=AliasChoices("committed", "comitted", "Committed", "Comitted"))
    available: Optional[int] = Field(default=None, validation_alias=AliasChoices("available", "Available"))
    onhand_old: Optional[int] = Field(default=None, validation_alias=AliasChoices("onhand_old", "onhand(old)", "onhand(old"))
    onhand_new: Optional[int] = Field(default=None, validation_alias=AliasChoices("onhand_new", "onhand(new)", "onhand(new)"))

    class Config:
        populate_by_name = True


class ProductResponse(BaseModel):
    id: int
    category_id: int
    subcategory_id: int
    brand_id: Optional[int] = None
    name: str
    slug: str
    short_description: Optional[str] = None
    description: Optional[str] = None
    sku: str
    barcode: Optional[str] = None
    price: Decimal
    discount_price: Optional[Decimal] = None
    tax_percentage: Decimal
    stock_quantity: int
    weight: Optional[float] = None
    length: Optional[float] = None
    width: Optional[float] = None
    height: Optional[float] = None
    thumbnail_image: Optional[str] = None
    status: str
    is_featured: bool
    is_active: bool
    created_by: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    # Extended Inventory & Shopify Integration Fields
    handle: Optional[str] = None
    title: Optional[str] = None
    option1_name: Optional[str] = None
    option2_name: Optional[str] = None
    option3_name: Optional[str] = None
    hs_code: Optional[str] = None
    country_of_origin: Optional[str] = None
    location: Optional[str] = None
    bin_name: Optional[str] = None
    incoming: int = 0
    unavailable: int = 0
    committed: int = 0
    available: int = 0
    onhand_old: int = 0
    onhand_new: int = 0

    # Nested Relations
    category: Optional[CategoryResponse] = None
    subcategory: Optional[SubCategoryResponse] = None
    brand: Optional[BrandResponse] = None
    images: List[ProductImageResponse] = []
    variants: List[ProductVariantResponse] = []
    attributes: List[ProductAttributeResponse] = []

    class Config:
        from_attributes = True
        populate_by_name = True
