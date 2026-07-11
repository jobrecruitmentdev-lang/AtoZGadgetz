import os
import sys
from datetime import datetime, timedelta
from decimal import Decimal

# Ensure backend app is on PYTHONPATH
sys.path.append(r"c:\Users\lenovo\Desktop\Aamir\AtoZ%20Gadget\AtoZ%20Gadget%20Backend")
sys.path.append(r"c:\Users\lenovo\Desktop\Aamir\AtoZ Gadget\AtoZ Gadget Backend")

from app.database.connection import SessionLocal
from app.models import (
    Category, SubCategory, Brand, Product, ProductImage, 
    ProductVariant, Attribute, ProductAttribute, ProductReview, 
    Offer, Banner, HomepageSection, FeaturedProduct, User
)
from app.utils.security import hash_password

def seed_catalog():
    db = SessionLocal()
    try:
        print("Cleaning tables...")
        # Clear existing transactional CMS and catalog tables first to avoid FK violations
        db.query(FeaturedProduct).delete()
        db.query(ProductReview).delete()
        db.query(ProductAttribute).delete()
        db.query(Attribute).delete()
        db.query(ProductVariant).delete()
        db.query(ProductImage).delete()
        db.query(Product).delete()
        db.query(SubCategory).delete()
        db.query(Category).delete()
        db.query(Brand).delete()
        db.query(Offer).delete()
        db.query(Banner).delete()
        db.query(HomepageSection).delete()
        db.commit()

        print("Seeding Banners...")
        now = datetime.now()
        future = now + timedelta(days=60)
        
        # Add banners
        banner1 = Banner(
            title="iPhone 16 Pro — Titanium Design",
            image="uploads/banners/iphone16pro.png",
            mobile_image="uploads/banners/iphone16pro_mobile.png",
            position="Homepage Slider",
            sort_order=1,
            redirect_url="/product/apple-iphone-16-pro",
            status="active",
            start_date=now,
            end_date=future
        )
        banner2 = Banner(
            title="Sony Wireless Noise Cancelling",
            image="uploads/banners/sony_wh1000xm5.png",
            mobile_image="uploads/banners/sony_wh1000xm5_mobile.png",
            position="Homepage Slider",
            sort_order=2,
            redirect_url="/product/sony-wh-1000xm5",
            status="active",
            start_date=now,
            end_date=future
        )
        banner3 = Banner(
            title="Wearable Health Tech Banners",
            image="uploads/banners/wearable_banner.png",
            position="Category Banner",
            sort_order=1,
            redirect_url="/category/smartwatch",
            status="active",
            start_date=now,
            end_date=future
        )
        db.add_all([banner1, banner2, banner3])

        print("Seeding Categories & Subcategories...")
        cat_mobile = Category(name="Mobiles", slug="mobile", description="Premium Smartphones & Accessories", image="uploads/categories/mobile.png", status="active")
        cat_laptop = Category(name="Laptops", slug="laptop", description="High performance notebooks & workstations", image="uploads/categories/laptop.png", status="active")
        cat_audio = Category(name="Audio", slug="audio", description="Premium headphones, earbuds, & speakers", image="uploads/categories/audio.png", status="active")
        cat_wearables = Category(name="Wearables", slug="smartwatch", description="Sleek smartwatches & fitness trackers", image="uploads/categories/smartwatch.png", status="active")
        db.add_all([cat_mobile, cat_laptop, cat_audio, cat_wearables])
        db.flush()

        sub_smartphone = SubCategory(category_id=cat_mobile.id, name="Smartphones", slug="smartphones", description="Sleek modern smartphones", status="active")
        sub_mobile_acc = SubCategory(category_id=cat_mobile.id, name="Accessories", slug="accessories", description="Covers, adapters and chargers", status="active")
        sub_notebook = SubCategory(category_id=cat_laptop.id, name="Notebooks", slug="notebooks", description="Ultra-portable notebooks", status="active")
        sub_gaming_laptop = SubCategory(category_id=cat_laptop.id, name="Gaming Laptops", slug="gaming-laptops", description="High frame rate gaming gear", status="active")
        sub_headphone = SubCategory(category_id=cat_audio.id, name="Headphones", slug="headphones", description="Over-ear noise cancelling headphones", status="active")
        sub_earbuds = SubCategory(category_id=cat_audio.id, name="Earbuds", slug="earbuds", description="True wireless stereo earbuds", status="active")
        sub_smartwatch = SubCategory(category_id=cat_wearables.id, name="Smartwatches", slug="smartwatches", description="Premium health trackers", status="active")
        db.add_all([sub_smartphone, sub_mobile_acc, sub_notebook, sub_gaming_laptop, sub_headphone, sub_earbuds, sub_smartwatch])
        db.flush()

        print("Seeding Brands...")
        brand_apple = Brand(name="Apple", slug="apple", logo="uploads/brands/apple.png", status="active")
        brand_samsung = Brand(name="Samsung", slug="samsung", logo="uploads/brands/samsung.png", status="active")
        brand_nothing = Brand(name="Nothing", slug="nothing", logo="uploads/brands/nothing.png", status="active")
        brand_sony = Brand(name="Sony", slug="sony", logo="uploads/brands/sony.png", status="active")
        brand_boat = Brand(name="boAt", slug="boat", logo="uploads/brands/boat.png", status="active")
        brand_hp = Brand(name="HP", slug="hp", logo="uploads/brands/hp.png", status="active")
        db.add_all([brand_apple, brand_samsung, brand_nothing, brand_sony, brand_boat, brand_hp])
        db.flush()

        # Seed global attributes
        attr_ram = Attribute(name="RAM")
        attr_storage = Attribute(name="Storage")
        attr_screen = Attribute(name="Screen Size")
        attr_color = Attribute(name="Color")
        db.add_all([attr_ram, attr_storage, attr_screen, attr_color])
        db.flush()

        # Retrieve a valid user to assign as creator (ID=1 or search superadmin)
        creator_user = db.query(User).filter(User.role_id == 1).first()
        if not creator_user:
            # Create a quick admin user if none exists
            creator_user = User(
                first_name="Seed", last_name="Admin", email="seedadmin@atoz.com",
                mobile="9876543299", password_hash=hash_password("SeedAdmin123!"),
                role_id=1, is_active=True
            )
            db.add(creator_user)
            db.flush()

        print("Seeding Products...")
        products_data = [
            {
                "name": "Apple iPhone 16 Pro",
                "slug": "apple-iphone-16-pro",
                "short_description": "Titanium design, A18 Pro chip, Camera Control, and a huge leap in battery life.",
                "description": "The iPhone 16 Pro features a Grade 5 Titanium design with a new refined micro-blasted finish. Powered by the incredibly fast A18 Pro chip, it offers advanced camera configurations, 48MP fusion cameras, and dedicated camera buttons.",
                "sku": "IPH16PRO-128",
                "price": Decimal("119900.00"),
                "discount_price": Decimal("114900.00"),
                "stock_quantity": 45,
                "is_featured": True,
                "category_id": cat_mobile.id,
                "subcategory_id": sub_smartphone.id,
                "brand_id": brand_apple.id,
                "images": ["uploads/products/iphone16pro.png", "uploads/products/iphone16pro_back.png"],
                "variants": [
                    {"name": "Storage", "value": "128GB", "price": Decimal("0.00"), "stock": 20},
                    {"name": "Storage", "value": "256GB", "price": Decimal("10000.00"), "stock": 25}
                ],
                "attributes": [
                    {"attr": attr_ram, "value": "8GB"},
                    {"attr": attr_storage, "value": "128GB"},
                    {"attr": attr_screen, "value": "6.3 inches"},
                    {"attr": attr_color, "value": "Natural Titanium"}
                ]
            },
            {
                "name": "Samsung Galaxy S24 Ultra",
                "slug": "samsung-galaxy-s24-ultra",
                "short_description": "Galaxy AI, Titanium frame, 200MP camera, and built-in S Pen.",
                "description": "Meet Galaxy S24 Ultra, the ultimate form of Galaxy Ultra with a new titanium exterior and a 6.8-inch flat screen. Boosted with Galaxy AI features like Circle to Search, Live Translate, Note Assist and Photo Assist.",
                "sku": "SAMS24U-256",
                "price": Decimal("129999.00"),
                "discount_price": Decimal("119999.00"),
                "stock_quantity": 30,
                "is_featured": True,
                "category_id": cat_mobile.id,
                "subcategory_id": sub_smartphone.id,
                "brand_id": brand_samsung.id,
                "images": ["uploads/products/s24ultra.png"],
                "variants": [
                    {"name": "Storage", "value": "256GB", "price": Decimal("0.00"), "stock": 15},
                    {"name": "Storage", "value": "512GB", "price": Decimal("12000.00"), "stock": 15}
                ],
                "attributes": [
                    {"attr": attr_ram, "value": "12GB"},
                    {"attr": attr_storage, "value": "256GB"},
                    {"attr": attr_screen, "value": "6.8 inches"},
                    {"attr": attr_color, "value": "Titanium Gray"}
                ]
            },
            {
                "name": "Nothing Phone (2a)",
                "slug": "nothing-phone-2a",
                "short_description": "Unique Glyph Interface, Dimensity 7200 Pro, and custom Nothing OS.",
                "description": "Nothing Phone (2a) offers powerful performance, clean OS design, and a signature transparent back with the Glyph Interface, creating a micro-interaction lights experience like no other.",
                "sku": "NOTH2A-128",
                "price": Decimal("23999.00"),
                "discount_price": Decimal("21999.00"),
                "stock_quantity": 80,
                "is_featured": False,
                "category_id": cat_mobile.id,
                "subcategory_id": sub_smartphone.id,
                "brand_id": brand_nothing.id,
                "images": ["uploads/products/phone2a.png"],
                "variants": [],
                "attributes": [
                    {"attr": attr_ram, "value": "8GB"},
                    {"attr": attr_storage, "value": "128GB"},
                    {"attr": attr_screen, "value": "6.7 inches"},
                    {"attr": attr_color, "value": "Milk White"}
                ]
            },
            {
                "name": "Sony WH-1000XM5 Wireless Headphones",
                "slug": "sony-wh-1000xm5",
                "short_description": "Industry-leading active noise cancelling with dual processors and auto-optimizer.",
                "description": "The WH-1000XM5 headphones rewrite the rules for distraction-free listening. 2 processors control 8 microphones for unprecedented noise cancelling and exceptional call quality.",
                "sku": "SONYXM5-BLK",
                "price": Decimal("29990.00"),
                "discount_price": Decimal("26990.00"),
                "stock_quantity": 25,
                "is_featured": True,
                "category_id": cat_audio.id,
                "subcategory_id": sub_headphone.id,
                "brand_id": brand_sony.id,
                "images": ["uploads/products/sony_wh1000xm5.png"],
                "variants": [],
                "attributes": [
                    {"attr": attr_color, "value": "Matte Black"},
                    {"attr": attr_screen, "value": "Wireless/Wired"}
                ]
            },
            {
                "name": "boAt Airdopes 181",
                "slug": "boat-airdopes-181",
                "short_description": "True wireless earbuds with ENx technology, 20 hours battery life and ASAP charge.",
                "description": "boAt Airdopes 181 delivers crisp sound with 10mm drivers, ENx noise cancellation for calls, and low latency beast mode for gaming.",
                "sku": "BOAT181-BLU",
                "price": Decimal("2999.00"),
                "discount_price": Decimal("999.00"),
                "stock_quantity": 200,
                "is_featured": False,
                "category_id": cat_audio.id,
                "subcategory_id": sub_earbuds.id,
                "brand_id": brand_boat.id,
                "images": ["uploads/products/boat181.png"],
                "variants": [],
                "attributes": [
                    {"attr": attr_color, "value": "Cool Blue"}
                ]
            },
            {
                "name": "MacBook Air M3 13-inch",
                "slug": "macbook-air-m3-13",
                "short_description": "Incredibly thin laptop, powerful M3 chip, up to 18 hours of battery life.",
                "description": "MacBook Air breezes through work and play — and the M3 chip brings even greater capabilities and advanced AI features to this super-portable laptop.",
                "sku": "MBA-M3-256",
                "price": Decimal("114900.00"),
                "discount_price": Decimal("104900.00"),
                "stock_quantity": 18,
                "is_featured": True,
                "category_id": cat_laptop.id,
                "subcategory_id": sub_notebook.id,
                "brand_id": brand_apple.id,
                "images": ["uploads/products/macbookair.png"],
                "variants": [
                    {"name": "RAM", "value": "8GB Unified", "price": Decimal("0.00"), "stock": 8},
                    {"name": "RAM", "value": "16GB Unified", "price": Decimal("20000.00"), "stock": 10}
                ],
                "attributes": [
                    {"attr": attr_ram, "value": "8GB"},
                    {"attr": attr_storage, "value": "256GB SSD"},
                    {"attr": attr_screen, "value": "13.6 inches Liquid Retina"},
                    {"attr": attr_color, "value": "Space Gray"}
                ]
            },
            {
                "name": "HP Victus Gaming Laptop 15",
                "slug": "hp-victus-15",
                "short_description": "Ryzen 5, RTX 3050, 144Hz display, engineered for casual and high-level gaming.",
                "description": "Play at your best with a powerful AMD Ryzen 5 processor, NVIDIA GeForce RTX 3050 graphics and an upgraded thermal design.",
                "sku": "HPVIC15-3050",
                "price": Decimal("72000.00"),
                "discount_price": Decimal("58990.00"),
                "stock_quantity": 10,
                "is_featured": False,
                "category_id": cat_laptop.id,
                "subcategory_id": sub_gaming_laptop.id,
                "brand_id": brand_hp.id,
                "images": ["uploads/products/hpvictus.png"],
                "variants": [],
                "attributes": [
                    {"attr": attr_ram, "value": "16GB DDR4"},
                    {"attr": attr_storage, "value": "512GB NVMe SSD"},
                    {"attr": attr_screen, "value": "15.6 inches FHD 144Hz"},
                    {"attr": attr_color, "value": "Performance Blue"}
                ]
            }
        ]

        for p_data in products_data:
            p_obj = Product(
                category_id=p_data["category_id"],
                subcategory_id=p_data["subcategory_id"],
                brand_id=p_data["brand_id"],
                name=p_data["name"],
                slug=p_data["slug"],
                short_description=p_data["short_description"],
                description=p_data["description"],
                sku=p_data["sku"],
                price=p_data["price"],
                discount_price=p_data["discount_price"],
                stock_quantity=p_data["stock_quantity"],
                is_featured=p_data["is_featured"],
                status="active",
                is_active=True,
                created_by=creator_user.id
            )
            db.add(p_obj)
            db.flush()

            # Seed images
            for idx, img in enumerate(p_data["images"]):
                db.add(ProductImage(
                    product_id=p_obj.id,
                    image=img,
                    alt_text=f"{p_obj.name} Image {idx+1}",
                    sort_order=idx
                ))

            # Seed variants
            for v in p_data["variants"]:
                db.add(ProductVariant(
                    product_id=p_obj.id,
                    variant_name=v["name"],
                    variant_value=v["value"],
                    additional_price=v["price"],
                    stock=v["stock"]
                ))

            # Seed attributes
            for attr_val in p_data["attributes"]:
                db.add(ProductAttribute(
                    product_id=p_obj.id,
                    attribute_id=attr_val["attr"].id,
                    value=attr_val["value"]
                ))

            # Seed reviews
            # Review 1
            db.add(ProductReview(
                product_id=p_obj.id,
                user_id=creator_user.id,
                rating=5,
                review="Exceptional build quality. Exceeded expectations.",
                status="approved"
            ))

        db.commit()

        # Seed CMS featured section linkages
        print("Linking Homepage CMS Sections...")
        trending_section = HomepageSection(title="Trending Products", section_type="Trending Products", sort_order=1, status="active")
        featured_section = HomepageSection(title="Featured Products", section_type="Featured Products", sort_order=2, status="active")
        new_arrivals_section = HomepageSection(title="New Arrivals", section_type="New Arrivals", sort_order=3, status="active")
        db.add_all([trending_section, featured_section, new_arrivals_section])
        db.flush()

        # Add links to featured products
        all_prods = db.query(Product).all()
        for idx, p in enumerate(all_prods):
            # Link first 3 to Trending
            if idx < 3:
                db.add(FeaturedProduct(section_id=trending_section.id, product_id=p.id, sort_order=idx))
            # Link featured ones to Featured section
            if p.is_featured:
                db.add(FeaturedProduct(section_id=featured_section.id, product_id=p.id, sort_order=idx))
            # Link all to New Arrivals
            db.add(FeaturedProduct(section_id=new_arrivals_section.id, product_id=p.id, sort_order=idx))

        # Seed Campaign Flash Offers
        print("Seeding Campaign Offers...")
        offer1 = Offer(
            name="Flash Deal 10% Off",
            description="Premium launch flash sales discount",
            offer_type="Cart",
            discount_type="Percentage",
            discount_value=Decimal("10.00"),
            minimum_order_amount=Decimal("0.00"),
            status="active",
            start_date=now - timedelta(hours=1),
            end_date=now + timedelta(hours=5) # Ends in 5 hours for flash countdown
        )
        db.add(offer1)
        db.commit()

        print("Seeding completed successfully! Total products seeded:", len(all_prods))
    except Exception as e:
        db.rollback()
        print("Seeding catalog failed:", e)
    finally:
        db.close()

if __name__ == "__main__":
    seed_catalog()
