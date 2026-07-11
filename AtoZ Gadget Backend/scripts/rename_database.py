import os
import sys
from sqlalchemy import create_engine, text, inspect

# Add project root to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.config.settings import settings

def migrate_database():
    source_db = "deodap_clone_db"
    target_db = "atoz_gadgets_db"
    
    # Parse root url from settings (without DB name)
    db_url = settings.DATABASE_URL
    if "/" in db_url:
        root_url = db_url.rsplit("/", 1)[0] + "/"
    else:
        print("Error: DATABASE_URL format is invalid.")
        return
        
    print(f"Connecting to MySQL Root Server: {root_url}")
    engine = create_engine(root_url)
    
    with engine.connect() as conn:
        # Check if source database exists
        dbs = [row[0] for row in conn.execute(text("SHOW DATABASES"))]
        if source_db not in dbs:
            print(f"Error: Source database '{source_db}' does not exist.")
            return
            
        # Create target database if it doesn't exist
        if target_db not in dbs:
            print(f"Creating target database '{target_db}'...")
            conn.execute(text(f"CREATE DATABASE `{target_db}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"))
            print(f"Database '{target_db}' created successfully.")
        else:
            print(f"Target database '{target_db}' already exists.")
            
    # Inspect tables from source
    source_engine = create_engine(db_url)
    inspector = inspect(source_engine)
    tables = inspector.get_table_names()
    
    print(f"\nFound {len(tables)} tables in source database '{source_db}'.")
    
    target_engine = create_engine(root_url + target_db)
    target_inspector = inspect(target_engine)
    existing_target_tables = set(target_inspector.get_table_names())
    
    copied_count = 0
    skipped_count = 0
    
    # Enable connection to run DDL operations
    with engine.begin() as conn:
        for table in tables:
            if table not in existing_target_tables:
                print(f"Duplicating table '{table}' from '{source_db}' to '{target_db}'...")
                # Copy table structure
                conn.execute(text(f"CREATE TABLE `{target_db}`.`{table}` LIKE `{source_db}`.`{table}`"))
                # Copy table data
                conn.execute(text(f"INSERT INTO `{target_db}`.`{table}` SELECT * FROM `{source_db}`.`{table}`"))
                print(f"Successfully duplicated table '{table}'.")
                copied_count += 1
            else:
                print(f"Table '{table}' already exists in '{target_db}'. Skipping.")
                skipped_count += 1
                
    print(f"\nDatabase Copy Summary:")
    print(f"- Tables Copied: {copied_count}")
    print(f"- Tables Skipped (Already Exist): {skipped_count}")
    print(f"Complete database migration to '{target_db}' succeeded!")

if __name__ == "__main__":
    migrate_database()
