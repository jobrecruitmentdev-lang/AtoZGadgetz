from app.database.connection import SessionLocal
from app.models.role import Role


def seed_roles():
    db = SessionLocal()
    roles = [
        {
            "id": 1,
            "role_name": "Super Admin",
            "description": "Full system access"
        },
        {
            "id": 2,
            "role_name": "Admin",
            "description": "Admin panel access"
        },
        {
            "id": 3,
            "role_name": "Customer",
            "description": "Website customer"
        }
    ]

    try:
        for r in roles:
            existing = db.query(Role).filter(Role.id == r["id"]).first()
            if not existing:
                existing = db.query(Role).filter(Role.role_name == r["role_name"]).first()

            if not existing:
                new_role = Role(
                    id=r["id"],
                    role_name=r["role_name"],
                    description=r["description"]
                )
                db.add(new_role)
            else:
                # Update description if it changed
                existing.description = r["description"]
                existing.role_name = r["role_name"]

        db.commit()
        print("Roles seeded successfully")
    except Exception as e:
        db.rollback()
        print("Role seeding error:", e)
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed_roles()