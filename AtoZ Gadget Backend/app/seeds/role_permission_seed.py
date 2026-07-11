from app.database.connection import SessionLocal
from app.models.role import Role
from app.models.permission import Permission
from app.models.role_permission import RolePermission


def seed_role_permissions():
    db = SessionLocal()

    try:
        super_admin = db.query(Role).filter(Role.role_name == "Super Admin").first()
        admin = db.query(Role).filter(Role.role_name == "Admin").first()
        customer = db.query(Role).filter(Role.role_name == "Customer").first()

        if not super_admin or not admin or not customer:
            print("Roles must be seeded first!")
            return

        all_permissions = db.query(Permission).all()
        permission_map = {p.permission_name: p for p in all_permissions}

        admin_perms = [
            "user.read",
            "user.update",
            "job.create",
            "job.read",
            "job.update"
        ]

        customer_perms = [
            "profile.read",
            "profile.update"
        ]

        # Assign all permissions to Super Admin
        for p in all_permissions:
            _assign_permission(db, super_admin.id, p.id)

        # Assign Admin permissions
        for name in admin_perms:
            p = permission_map.get(name)
            if p:
                _assign_permission(db, admin.id, p.id)

        # Assign Customer permissions
        for name in customer_perms:
            p = permission_map.get(name)
            if p:
                _assign_permission(db, customer.id, p.id)

        db.commit()
        print("Role permissions seeded successfully")
    except Exception as e:
        db.rollback()
        print("Role permissions seeding error:", e)
        raise e
    finally:
        db.close()


def _assign_permission(db, role_id: int, permission_id: int):
    existing = db.query(RolePermission).filter(
        RolePermission.role_id == role_id,
        RolePermission.permission_id == permission_id
    ).first()

    if not existing:
        rp = RolePermission(role_id=role_id, permission_id=permission_id)
        db.add(rp)
