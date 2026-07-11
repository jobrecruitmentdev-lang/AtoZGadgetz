import os
import sys
from sqlalchemy import create_engine, inspect, text

# Add project root to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.config.settings import settings

def run_migration():
    print(f"Connecting to database: {settings.DATABASE_URL}")
    engine = create_engine(settings.DATABASE_URL)
    inspector = inspect(engine)
    
    tables = inspector.get_table_names()
    if "products" not in tables:
        print("Error: 'products' table does not exist. Please ensure base tables are created first.")
        return
        
    existing_columns = {col['name'] for col in inspector.get_columns("products")}
    
    # Define columns to add (name, sql_type, default)
    columns_to_add = [
        ("handle", "VARCHAR(255) NULL", None),
        ("title", "VARCHAR(255) NULL", None),
        ("option1_name", "VARCHAR(100) NULL", None),
        ("option2_name", "VARCHAR(100) NULL", None),
        ("option3_name", "VARCHAR(100) NULL", None),
        ("hs_code", "VARCHAR(100) NULL", None),
        ("country_of_origin", "VARCHAR(100) NULL", None),
        ("location", "VARCHAR(100) NULL", None),
        ("bin_name", "VARCHAR(100) NULL", None),
        ("incoming", "INT NOT NULL DEFAULT 0", 0),
        ("unavailable", "INT NOT NULL DEFAULT 0", 0),
        ("committed", "INT NOT NULL DEFAULT 0", 0),
        ("available", "INT NOT NULL DEFAULT 0", 0),
        ("onhand_old", "INT NOT NULL DEFAULT 0", 0),
        ("onhand_new", "INT NOT NULL DEFAULT 0", 0)
    ]
    
    added_any = False
    with engine.begin() as conn:
        for col_name, sql_type, default in columns_to_add:
            if col_name not in existing_columns:
                print(f"Adding column '{col_name}' ({sql_type})...")
                alter_query = f"ALTER TABLE products ADD COLUMN `{col_name}` {sql_type}"
                conn.execute(text(alter_query))
                
                # If there are existing records, populate defaults if needed
                if default is not None:
                    update_query = f"UPDATE products SET `{col_name}` = :val WHERE `{col_name}` IS NULL"
                    conn.execute(text(update_query), {"val": default})
                    
                added_any = True
                print(f"Successfully added column '{col_name}'.")
            else:
                print(f"Column '{col_name}' already exists. Skipping.")
                
    if added_any:
        print("Schema migration completed successfully!")
    else:
        print("No columns were missing. Database schema is already up to date.")

if __name__ == "__main__":
    run_migration()
