"""
Direct PostgreSQL Schema Creation and Data Migration
"""

import os
import sys
from pathlib import Path
import shutil
from datetime import datetime

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))
os.chdir(Path(__file__).parent.parent.parent)

# Now import after path is set
from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "")
SQLITE_URL = "sqlite:///./iliski_analiz.db"

print("=" * 60)
print("🚀 PostgreSQL Migration")
print("=" * 60)

# Validate PostgreSQL URL
if "sqlite" in DATABASE_URL.lower():
    print("❌ ERROR: DATABASE_URL still points to SQLite!")
    sys.exit(1)

print(f"Source: {SQLITE_URL}")
print(f"Target: {DATABASE_URL[:60]}...")
print()

# Step 1: Backup
print("Step 1/3: Backing up SQLite database")
sqlite_file = Path("iliski_analiz.db")
if sqlite_file.exists():
    backup_name = f"iliski_analiz_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.db"
    shutil.copy2(sqlite_file, backup_name)
    print(f"✅ Backup created: {backup_name}")
else:
    print("⚠️  No SQLite database found")
print()

# Step 2: Create PostgreSQL schema
print("Step 2/3: Creating PostgreSQL schema")
try:
    # Import Base after environment is loaded
    from backend.app.models.database import Base
    from backend.app.core.database import engine as pg_engine
    
    # Create all tables
    Base.metadata.create_all(bind=pg_engine)
    print("✅ Schema created successfully")
    
    # Verify tables
    inspector = inspect(pg_engine)
    tables = inspector.get_table_names()
    print(f"✅ Created {len(tables)} tables: {', '.join(tables)}")
    
except Exception as e:
    print(f"❌ Schema creation failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print()

# Step 3: Migrate data
print("Step 3/3: Migrating data from SQLite")
try:
    sqlite_engine = create_engine(SQLITE_URL)
    SqliteSession = sessionmaker(bind=sqlite_engine)
    PostgresSession = sessionmaker(bind=pg_engine)
    
    sqlite_session = SqliteSession()
    postgres_session = PostgresSession()
    
    from backend.app.models.database import User, Analysis, CoachingStatus, ChatSession, ChatMessage, DailyPulse, Feedback, AnalysisHistory
    
    # Order matters due to foreign keys
    models = [User, CoachingStatus, Analysis, AnalysisHistory, Feedback, ChatSession, ChatMessage, DailyPulse]
    
    total_migrated = 0
    for model in models:
        table_name = model.__tablename__
        try:
            records = sqlite_session.query(model).all()
            count = len(records)
            
            if count == 0:
                print(f"  ⏭️  {table_name}: No data")
                continue
            
            print(f"  🔄 Migrating {table_name}: {count} records...")
            
            for record in records:
                # Copy all attributes except id (let PostgreSQL auto-generate)
                data = {c.name: getattr(record, c.name) for c in record.__table__.columns if c.name != 'id'}
                new_record = model(**data)
                postgres_session.add(new_record)
            
            postgres_session.commit()
            total_migrated += count
            print(f"  ✅ {table_name}: {count} records migrated")
            
        except Exception as e:
            postgres_session.rollback()
            print(f"  ⚠️  {table_name}: {e}")
    
    sqlite_session.close()
    postgres_session.close()
    
    print()
    print("=" * 60)
    print(f"✅ Migration completed! {total_migrated} total records migrated")
    print("=" * 60)
    
except Exception as e:
    print(f"❌ Data migration failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print()
print("Next steps:")
print("1. Test backend with: uvicorn backend.app.main:app --reload")
print("2. Verify data in PostgreSQL")
print("3. Update Railway with same DATABASE_URL")
