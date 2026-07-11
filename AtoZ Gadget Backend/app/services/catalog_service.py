from typing import List
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.category import Category
from app.models.subcategory import SubCategory
from app.models.brand import Brand
from app.schemas.category_schema import CategoryCreate, CategoryUpdate
from app.schemas.subcategory_schema import SubCategoryCreate, SubCategoryUpdate
from app.schemas.brand_schema import BrandCreate, BrandUpdate
from app.utils.slug import slugify


def get_unique_slug(db: Session, model, name: str) -> str:
    base_slug = slugify(name)
    slug = base_slug
    counter = 1
    # Check uniqueness
    while db.query(model).filter(model.slug == slug).first() is not None:
        slug = f"{base_slug}-{counter}"
        counter += 1
    return slug


class CatalogService:

    # --- Category CRUD ---
    def create_category(self, db: Session, cat_in: CategoryCreate) -> Category:
        slug = get_unique_slug(db, Category, cat_in.name)
        db_cat = Category(
            name=cat_in.name,
            slug=slug,
            description=cat_in.description,
            image=cat_in.image,
            status=cat_in.status
        )
        db.add(db_cat)
        db.commit()
        db.refresh(db_cat)
        return db_cat

    def get_categories(self, db: Session) -> List[Category]:
        return db.query(Category).all()

    def get_category_by_id(self, db: Session, cat_id: int) -> Category:
        cat = db.query(Category).filter(Category.id == cat_id).first()
        if not cat:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found"
            )
        return cat

    def update_category(self, db: Session, cat_id: int, cat_in: CategoryUpdate) -> Category:
        db_cat = self.get_category_by_id(db, cat_id)
        update_data = cat_in.model_dump(exclude_unset=True)

        if "name" in update_data and update_data["name"] != db_cat.name:
            update_data["slug"] = get_unique_slug(db, Category, update_data["name"])

        for field, value in update_data.items():
            setattr(db_cat, field, value)

        db.add(db_cat)
        db.commit()
        db.refresh(db_cat)
        return db_cat

    def delete_category(self, db: Session, cat_id: int) -> bool:
        db_cat = self.get_category_by_id(db, cat_id)
        db.delete(db_cat)
        db.commit()
        return True

    # --- SubCategory CRUD ---
    def create_subcategory(self, db: Session, sub_in: SubCategoryCreate) -> SubCategory:
        # Validate category existence
        category = db.query(Category).filter(Category.id == sub_in.category_id).first()
        if not category:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid Category ID: category does not exist"
            )

        slug = get_unique_slug(db, SubCategory, sub_in.name)
        db_sub = SubCategory(
            category_id=sub_in.category_id,
            name=sub_in.name,
            slug=slug,
            description=sub_in.description,
            status=sub_in.status
        )
        db.add(db_sub)
        db.commit()
        db.refresh(db_sub)
        return db_sub

    def get_subcategories(self, db: Session) -> List[SubCategory]:
        return db.query(SubCategory).all()

    def get_subcategory_by_id(self, db: Session, sub_id: int) -> SubCategory:
        sub = db.query(SubCategory).filter(SubCategory.id == sub_id).first()
        if not sub:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="SubCategory not found"
            )
        return sub

    def update_subcategory(self, db: Session, sub_id: int, sub_in: SubCategoryUpdate) -> SubCategory:
        db_sub = self.get_subcategory_by_id(db, sub_id)
        update_data = sub_in.model_dump(exclude_unset=True)

        if "category_id" in update_data:
            category = db.query(Category).filter(Category.id == update_data["category_id"]).first()
            if not category:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid Category ID: category does not exist"
                )

        if "name" in update_data and update_data["name"] != db_sub.name:
            update_data["slug"] = get_unique_slug(db, SubCategory, update_data["name"])

        for field, value in update_data.items():
            setattr(db_sub, field, value)

        db.add(db_sub)
        db.commit()
        db.refresh(db_sub)
        return db_sub

    def delete_subcategory(self, db: Session, sub_id: int) -> bool:
        db_sub = self.get_subcategory_by_id(db, sub_id)
        db.delete(db_sub)
        db.commit()
        return True

    # --- Brand CRUD ---
    def create_brand(self, db: Session, brand_in: BrandCreate) -> Brand:
        slug = get_unique_slug(db, Brand, brand_in.name)
        db_brand = Brand(
            name=brand_in.name,
            slug=slug,
            logo=brand_in.logo,
            status=brand_in.status
        )
        db.add(db_brand)
        db.commit()
        db.refresh(db_brand)
        return db_brand

    def get_brands(self, db: Session) -> List[Brand]:
        return db.query(Brand).all()

    def get_brand_by_id(self, db: Session, brand_id: int) -> Brand:
        brand = db.query(Brand).filter(Brand.id == brand_id).first()
        if not brand:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Brand not found"
            )
        return brand

    def update_brand(self, db: Session, brand_id: int, brand_in: BrandUpdate) -> Brand:
        db_brand = self.get_brand_by_id(db, brand_id)
        update_data = brand_in.model_dump(exclude_unset=True)

        if "name" in update_data and update_data["name"] != db_brand.name:
            update_data["slug"] = get_unique_slug(db, Brand, update_data["name"])

        for field, value in update_data.items():
            setattr(db_brand, field, value)

        db.add(db_brand)
        db.commit()
        db.refresh(db_brand)
        return db_brand

    def delete_brand(self, db: Session, brand_id: int) -> bool:
        db_brand = self.get_brand_by_id(db, brand_id)
        db.delete(db_brand)
        db.commit()
        return True


catalog_service = CatalogService()
