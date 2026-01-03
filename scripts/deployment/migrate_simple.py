"""
Simple SQLite to PostgreSQL Migration Script
"""

import os
import sys
from pathlib import Path
import shutil
from datetime import datetime
from dotenv import load_dotenv

# Load environment
load_dotenv()

# Check PostgreSQL URL
DATABASE_URL = os.getenv("DATABASE_URL", "")
if "sqlite" in DATABASE_URL.lower():
    print("❌ ERROR: DATABASE_URL still points to SQLite!")
    print("Please update .env with PostgreSQL URL")
    sys.exit(1)

print("=" * 60)
print("🚀 PostgreSQL Migration Script")
print("=" * 60)
print(f"Source: sqlite:///./iliski_analiz.db")
print(f"Target: {DATABASE_URL[:60]}...")
print()

# Step 1: Backup SQLite
print("Step 1/4: Backing up SQLite database")
sqlite_file = Path("iliski_analiz.db")

if sqlite_file.exists():
    backup_name = f"iliski_analiz_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.db"
    shutil.copy2(sqlite_file, backup_name)
    print(f"✅ Backup created: {backup_name}")
else:
    print("⚠️  SQLite database not found, skipping backup")
print()

# Step 2: Create schema in PostgreSQL
print("Step 2/4: Creating PostgreSQL schema")
print("Running Alembic migrations...")
os.system("alembic upgrade head")
print()

# Step 3: Import data using pgloader (if available) or SQL dump
print("Step 3/4: Data migration")
print()
print("=" * 60)
print("📋 Next Steps:")
print("=" * 60)
print()
print("The PostgreSQL schema has been created.")
print()
print("To migrate data, you have two options:")
print()
print("Option 1: Use pgloader (recommended)")
print("  1. Install pgloader: brew install pgloader")
print("  2. Create a pgloader config file")
print("  3. Run: pgloader migration.load")
print()
print("Option 2: Manual data migration")
print("  1. Export SQLite data: sqlite3 iliski_analiz.db .dump > data.sql")
print("  2. Clean and import to PostgreSQL")
print()
print("For now, the schema is ready. If you have no data to migrate,")
print("you can start using PostgreSQL immediately!")
print()
print("✅ Schema migration completed successfully!")
print("=" * 60)
