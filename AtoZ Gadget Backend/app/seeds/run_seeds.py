from app.seeds.role_seed import seed_roles
from app.seeds.permission_seed import seed_permissions
from app.seeds.role_permission_seed import seed_role_permissions


def run_all_seeds():
    print("Starting database seeding...")
    seed_roles()
    seed_permissions()
    seed_role_permissions()
    print("Database seeding completed successfully.")


if __name__ == "__main__":
    run_all_seeds()
