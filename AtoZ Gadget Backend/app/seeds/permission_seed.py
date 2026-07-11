from app.database.connection import SessionLocal
from app.models.permission import Permission

permissions = [
    {
        "permission_name": "user.create",
        "module_name": "user",
        "description": "Create new users"
    },
    {
        "permission_name": "user.read",
        "module_name": "user",
        "description": "View users"
    },
    {
        "permission_name": "user.update",
        "module_name": "user",
        "description": "Update users"
    },
    {
        "permission_name": "user.delete",
        "module_name": "user",
        "description": "Delete users"
    },
    {
        "permission_name": "job.create",
        "module_name": "job",
        "description": "Create jobs"
    },
    {
        "permission_name": "job.read",
        "module_name": "job",
        "description": "View jobs"
    },
    {
        "permission_name": "job.update",
        "module_name": "job",
        "description": "Update jobs"
    },
    {
        "permission_name": "job.delete",
        "module_name": "job",
        "description": "Delete jobs"
    },
    {
        "permission_name": "profile.read",
        "module_name": "profile",
        "description": "View profile"
    },
    {
        "permission_name": "profile.update",
        "module_name": "profile",
        "description": "Update profile"
    }
]


def seed_permissions():
    db = SessionLocal()

    try:
        for p in permissions:
            existing = db.query(Permission).filter(
                Permission.permission_name == p["permission_name"]
            ).first()

            if not existing:
                new_permission = Permission(
                    permission_name=p["permission_name"],
                    module_name=p["module_name"],
                    description=p["description"]
                )
                db.add(new_permission)
            else:
                existing.module_name = p["module_name"]
                existing.description = p["description"]

        db.commit()
        print("Permissions seeded successfully")
    except Exception as e:
        db.rollback()
        print("Permission seeding error:", e)
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed_permissions()