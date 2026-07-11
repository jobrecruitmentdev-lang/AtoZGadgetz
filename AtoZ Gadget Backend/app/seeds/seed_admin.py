from app.database.connection import SessionLocal
from app.models.user import User
from app.utils.security import hash_password

def seed_users():
    db = SessionLocal()
    try:
        # Check if Super Admin already exists
        super_admin = db.query(User).filter(User.email == "superadmin@deodap.com").first()
        if not super_admin:
            print("Seeding Super Admin...")
            super_admin = User(
                first_name="Super",
                last_name="Admin",
                email="superadmin@deodap.com",
                mobile="9999999991",
                password_hash=hash_password("SuperAdmin123!"),
                role_id=1,  # Super Admin Role
                is_active=True
            )
            db.add(super_admin)

        # Check if Admin already exists
        admin = db.query(User).filter(User.email == "admin@deodap.com").first()
        if not admin:
            print("Seeding Admin...")
            admin = User(
                first_name="Default",
                last_name="Admin",
                email="admin@deodap.com",
                mobile="9999999992",
                password_hash=hash_password("Admin123!"),
                role_id=2,  # Admin Role
                is_active=True
            )
            db.add(admin)

        # Check if Customer already exists
        customer = db.query(User).filter(User.email == "customer@deodap.com").first()
        if not customer:
            print("Seeding Customer...")
            customer = User(
                first_name="Default",
                last_name="Customer",
                email="customer@deodap.com",
                mobile="9999999993",
                password_hash=hash_password("Customer123!"),
                role_id=3,  # Customer Role
                is_active=True
            )
            db.add(customer)

        db.commit()
        print("Seeding completed successfully!")
    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_users()
