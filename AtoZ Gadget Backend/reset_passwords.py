"""
Quick script to reset all seed user passwords
"""
from app.database.connection import SessionLocal
from app.models.user import User
from app.utils.security import hash_password

def reset_passwords():
    db = SessionLocal()
    try:
        users_to_reset = [
            ("superadmin@deodap.com", "SuperAdmin123!"),
            ("admin@deodap.com", "Admin123!"),
            ("customer@deodap.com", "Customer123!"),
        ]
        
        for email, password in users_to_reset:
            user = db.query(User).filter(User.email == email).first()
            if user:
                user.password_hash = hash_password(password)
                print(f"[OK] Reset password for {email}")
            else:
                print(f"[NOT FOUND] User not found: {email}")
        
        db.commit()
        print("\nAll passwords reset successfully!")
    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    reset_passwords()
