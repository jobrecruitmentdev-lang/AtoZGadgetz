from typing import List, Tuple, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc
from fastapi import HTTPException, status

from app.models.product import Product
from app.models.category import Category
from app.models.subcategory import SubCategory
from app.models.brand import Brand
from app.models.product_image import ProductImage
from app.models.product_variant import ProductVariant
from app.models.attribute import Attribute
from app.models.product_attribute import ProductAttribute

from app.schemas.product_schema import (
    ProductCreate,
    ProductUpdate,
    ProductImageCreate,
    ProductVariantCreate,
    ProductAttributeCreate
)
from app.services.catalog_service import get_unique_slug


class ProductService:

    def create_product(self, db: Session, prod_in: ProductCreate, user_id: int) -> Product:
        # Validate Category
        cat = db.query(Category).filter(Category.id == prod_in.category_id).first()
        if not cat:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Category does not exist"
            )

        # Validate SubCategory
        sub = db.query(SubCategory).filter(SubCategory.id == prod_in.subcategory_id).first()
        if not sub:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="SubCategory does not exist"
            )
        if sub.category_id != prod_in.category_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="SubCategory does not belong to the selected Category"
            )

        # Validate Brand if provided
        if prod_in.brand_id:
            brand = db.query(Brand).filter(Brand.id == prod_in.brand_id).first()
            if not brand:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Brand does not exist"
                )

        # Validate SKU uniqueness
        existing_sku = db.query(Product).filter(Product.sku == prod_in.sku).first()
        if existing_sku:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="SKU already exists"
            )

        # Generate slug and map fields
        slug = get_unique_slug(db, Product, prod_in.name)
        prod_data = prod_in.model_dump()
        prod_data["slug"] = slug
        prod_data["created_by"] = user_id

        db_prod = Product(**prod_data)
        db.add(db_prod)
        db.commit()
        db.refresh(db_prod)
        return db_prod

    def get_products_paginated(
        self,
        db: Session,
        skip: int = 0,
        limit: int = 10,
        search: Optional[str] = None,
        category_id: Optional[int] = None,
        brand_id: Optional[int] = None,
        status_filter: Optional[str] = None,
        sort_price: Optional[str] = None  # "asc" or "desc"
    ) -> Tuple[List[Product], int]:
        query = db.query(Product)

        if search:
            search_pat = f"%{search}%"
            query = query.filter(
                or_(
                    Product.name.like(search_pat),
                    Product.short_description.like(search_pat),
                    Product.description.like(search_pat),
                    Product.sku.like(search_pat)
                )
            )

        if category_id is not None:
            query = query.filter(Product.category_id == category_id)

        if brand_id is not None:
            query = query.filter(Product.brand_id == brand_id)

        if status_filter is not None:
            query = query.filter(Product.status == status_filter)

        if sort_price == "asc":
            query = query.order_by(asc(Product.price))
        elif sort_price == "desc":
            query = query.order_by(desc(Product.price))
        else:
            query = query.order_by(desc(Product.created_at))

        total = query.count()
        items = query.offset(skip).limit(limit).all()
        return items, total

    def get_product_by_id(self, db: Session, prod_id: int) -> Product:
        prod = db.query(Product).filter(Product.id == prod_id).first()
        if not prod:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        return prod

    def update_product(self, db: Session, prod_id: int, prod_in: ProductUpdate) -> Product:
        db_prod = self.get_product_by_id(db, prod_id)
        update_data = prod_in.model_dump(exclude_unset=True)

        if "category_id" in update_data:
            cat = db.query(Category).filter(Category.id == update_data["category_id"]).first()
            if not cat:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Category does not exist"
                )

        if "subcategory_id" in update_data:
            sub = db.query(SubCategory).filter(SubCategory.id == update_data["subcategory_id"]).first()
            if not sub:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="SubCategory does not exist"
                )
            cat_id = update_data.get("category_id", db_prod.category_id)
            if sub.category_id != cat_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="SubCategory does not belong to the selected Category"
                )

        if "brand_id" in update_data and update_data["brand_id"] is not None:
            brand = db.query(Brand).filter(Brand.id == update_data["brand_id"]).first()
            if not brand:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Brand does not exist"
                )

        if "sku" in update_data and update_data["sku"] != db_prod.sku:
            existing_sku = db.query(Product).filter(Product.sku == update_data["sku"]).first()
            if existing_sku:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="SKU already exists"
                )

        if "name" in update_data and update_data["name"] != db_prod.name:
            update_data["slug"] = get_unique_slug(db, Product, update_data["name"])

        for field, value in update_data.items():
            setattr(db_prod, field, value)

        db.add(db_prod)
        db.commit()
        db.refresh(db_prod)
        return db_prod

    def delete_product(self, db: Session, prod_id: int) -> bool:
        db_prod = self.get_product_by_id(db, prod_id)
        db.delete(db_prod)
        db.commit()
        return True

    # --- Product Images ---
    def add_product_image(self, db: Session, prod_id: int, img_in: ProductImageCreate) -> ProductImage:
        self.get_product_by_id(db, prod_id)
        db_img = ProductImage(
            product_id=prod_id,
            image=img_in.image,
            alt_text=img_in.alt_text,
            sort_order=img_in.sort_order
        )
        db.add(db_img)
        db.commit()
        db.refresh(db_img)
        return db_img

    def get_product_images(self, db: Session, prod_id: int) -> List[ProductImage]:
        self.get_product_by_id(db, prod_id)
        return db.query(ProductImage).filter(
            ProductImage.product_id == prod_id
        ).order_by(ProductImage.sort_order.asc()).all()

    def delete_product_image(self, db: Session, img_id: int) -> bool:
        db_img = db.query(ProductImage).filter(ProductImage.id == img_id).first()
        if not db_img:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product image not found"
            )
        db.delete(db_img)
        db.commit()
        return True

    # --- Product Variants ---
    def add_product_variant(self, db: Session, prod_id: int, var_in: ProductVariantCreate) -> ProductVariant:
        self.get_product_by_id(db, prod_id)
        db_var = ProductVariant(
            product_id=prod_id,
            variant_name=var_in.variant_name,
            variant_value=var_in.variant_value,
            additional_price=var_in.additional_price,
            stock=var_in.stock
        )
        db.add(db_var)
        db.commit()
        db.refresh(db_var)
        return db_var

    def get_product_variants(self, db: Session, prod_id: int) -> List[ProductVariant]:
        self.get_product_by_id(db, prod_id)
        return db.query(ProductVariant).filter(
            ProductVariant.product_id == prod_id
        ).all()

    def delete_product_variant(self, db: Session, var_id: int) -> bool:
        db_var = db.query(ProductVariant).filter(ProductVariant.id == var_id).first()
        if not db_var:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product variant not found"
            )
        db.delete(db_var)
        db.commit()
        return True

    # --- Product Attributes ---
    def add_product_attribute(self, db: Session, prod_id: int, attr_in: ProductAttributeCreate) -> ProductAttribute:
        self.get_product_by_id(db, prod_id)
        
        attr_id = attr_in.attribute_id

        # Auto-create master attribute if name is supplied
        if attr_in.attribute_name:
            name_stripped = attr_in.attribute_name.strip()
            attr = db.query(Attribute).filter(Attribute.name == name_stripped).first()
            if not attr:
                attr = Attribute(name=name_stripped)
                db.add(attr)
                db.commit()
                db.refresh(attr)
            attr_id = attr.id

        if not attr_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Either attribute_id or attribute_name must be provided"
            )

        # Validate master attribute existence
        attr_master = db.query(Attribute).filter(Attribute.id == attr_id).first()
        if not attr_master:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Attribute does not exist in master list"
            )

        # Check if already mapped
        existing = db.query(ProductAttribute).filter(
            ProductAttribute.product_id == prod_id,
            ProductAttribute.attribute_id == attr_id
        ).first()

        if existing:
            existing.value = attr_in.value
            db.add(existing)
            db.commit()
            db.refresh(existing)
            return existing

        db_attr = ProductAttribute(
            product_id=prod_id,
            attribute_id=attr_id,
            value=attr_in.value
        )
        db.add(db_attr)
        db.commit()
        db.refresh(db_attr)
        return db_attr

    def get_product_attributes(self, db: Session, prod_id: int) -> List[ProductAttribute]:
        self.get_product_by_id(db, prod_id)
        return db.query(ProductAttribute).filter(
            ProductAttribute.product_id == prod_id
        ).all()

    def delete_product_attribute(self, db: Session, attr_map_id: int) -> bool:
        db_attr = db.query(ProductAttribute).filter(ProductAttribute.id == attr_map_id).first()
        if not db_attr:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product attribute mapping not found"
            )
        db.delete(db_attr)
        db.commit()
        return True


product_service = ProductService()
