from datetime import datetime, timedelta
from decimal import Decimal
from app.database.connection import SessionLocal
from app.models import Permission, RolePermission, HomepageSection, Banner, Offer

def seed_phase5():
    db = SessionLocal()
    try:
        # 1. Define new permissions with mandatory module names
        permissions_list = [
            ("dashboard.view", "dashboard", "View admin dashboard analytics"),
            ("product.manage", "product", "Manage product catalog, variants, and attributes"),
            ("order.manage", "order", "Manage customer orders and status updates"),
            ("customer.manage", "customer", "View customer profiles and activate/deactivate accounts"),
            ("banner.manage", "banner", "Manage banners and homepage CMS content sections"),
            ("offer.manage", "offer", "Manage campaigns, offers, and discount values"),
            ("report.view", "report", "View business performance sales reports"),
            ("inventory.manage", "inventory", "Manage inventory stock ledger and adjustments")
        ]

        print("Seeding permissions...")
        permission_objects = {}
        for name, mod_name, desc in permissions_list:
            perm = db.query(Permission).filter(Permission.permission_name == name).first()
            if not perm:
                perm = Permission(permission_name=name, module_name=mod_name, description=desc)
                db.add(perm)
                db.flush()
            permission_objects[name] = perm.id

        db.commit()

        # 2. Assign permissions to Admin (role_id = 2) and Super Admin (role_id = 1)
        print("Linking permissions to Admin role...")
        for name, perm_id in permission_objects.items():
            # Link to Admin (role_id = 2)
            existing_admin = db.query(RolePermission).filter(
                RolePermission.role_id == 2,
                RolePermission.permission_id == perm_id
            ).first()
            if not existing_admin:
                db.add(RolePermission(role_id=2, permission_id=perm_id))

            # Link to Super Admin (role_id = 1)
            existing_super = db.query(RolePermission).filter(
                RolePermission.role_id == 1,
                RolePermission.permission_id == perm_id
            ).first()
            if not existing_super:
                db.add(RolePermission(role_id=1, permission_id=perm_id))
        
        db.commit()

        # 3. Seed Homepage CMS Sections
        print("Seeding Homepage CMS Sections...")
        sections = [
            ("Trending Products", "Trending Products", 1),
            ("Featured Products", "Featured Products", 2),
            ("New Arrivals", "New Arrivals", 3)
        ]
        for title, sec_type, sort in sections:
            exists = db.query(HomepageSection).filter(HomepageSection.title == title).first()
            if not exists:
                db.add(HomepageSection(title=title, section_type=sec_type, sort_order=sort, status="active"))

        # 4. Seed Banners
        print("Seeding Sample Banners...")
        now = datetime.now()
        future = now + timedelta(days=30)
        banners_list = [
            ("Big Festive Sale Slider", "uploads/banners/festive_slider.png", "Homepage Slider", 1, "/festive-offers"),
            ("New Electronics Electronics Banner", "uploads/banners/elec_banner.png", "Category Banner", 2, "/category/electronics")
        ]
        for title, img, pos, sort, url in banners_list:
            exists = db.query(Banner).filter(Banner.title == title).first()
            if not exists:
                db.add(Banner(
                    title=title,
                    image=img,
                    position=pos,
                    sort_order=sort,
                    redirect_url=url,
                    status="active",
                    start_date=now,
                    end_date=future
                ))

        # 5. Seed Offers
        print("Seeding Sample Campaign Offers...")
        offers_list = [
            ("Cart Festival Discount", "Flat 100 off on order above 1000", "Festival", "Flat", Decimal("100.00"), Decimal("1000.00")),
            ("Mega Festival Cart Discount", "10% off on all cart checkout", "Cart", "Percentage", Decimal("10.00"), Decimal("0.00"))
        ]
        for name, desc, o_type, d_type, d_val, min_amt in offers_list:
            exists = db.query(Offer).filter(Offer.name == name).first()
            if not exists:
                db.add(Offer(
                    name=name,
                    description=desc,
                    offer_type=o_type,
                    discount_type=d_type,
                    discount_value=d_val,
                    minimum_order_amount=min_amt,
                    status="active",
                    start_date=now,
                    end_date=future
                ))

        db.commit()
        print("Phase 5 Seeding completed successfully!")
    except Exception as e:
        db.rollback()
        print(f"Error during Phase 5 seeding: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_phase5()
