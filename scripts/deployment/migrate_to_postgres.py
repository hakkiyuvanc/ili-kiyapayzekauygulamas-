"""
SQLite to PostgreSQL Migration Script
Usage: python scripts/migrate_to_postgres.py

IMPORTANT: 
1. Backup your SQLite database first
2. Update DATABASE_URL in .env to PostgreSQL before running
3. Install psycopg2-binary: pip install psycopg2-binary
"""

import os
import sys
from pathlib import Path
from sqlalchemy import create_engine, MetaData
from sqlalchemy.orm import sessionmaker
import logging
from datetime import datetime
import shutil

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent / 'backend'))

from app.core.config import settings
from app.models.database import Base, User, Analysis, CoachingStatus

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Source: SQLite
SQLITE_URL = "sqlite:///./iliski_analiz.db"

def backup_sqlite():
    """Backup SQLite database"""
    sqlite_file = Path("iliski_analiz.db")
    
    if not sqlite_file.exists():
        logger.warning("⚠️ SQLite database not found, skipping backup")
        return None
    
    backup_name = f"iliski_analiz_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.db"
    shutil.copy2(sqlite_file, backup_name)
    logger.info(f"✅ Backup created: {backup_name}")
    return backup_name

def create_postgres_schema(postgres_engine):
    """Create PostgreSQL schema from SQLAlchemy models"""
    logger.info("📋 Creating PostgreSQL schema...")
    try:
        Base.metadata.create_all(bind=postgres_engine)
        logger.info("✅ Schema created successfully")
        return True
    except Exception as e:
        logger.error(f"❌ Schema creation failed: {e}")
        return False

def migrate_table(sqlite_session, postgres_session, table_name, model_class):
    """Migrate single table from SQLite to PostgreSQL"""
    logger.info(f"🔄 Migrating table: {table_name}")
    
    try:
        # Read from SQLite
        records = sqlite_session.query(model_class).all()
        count = len(records)
        logger.info(f"  Found {count} records")
        
        if count == 0:
            logger.info(f"  ⏭️  No data to migrate")
            return True
        
        # Write to PostgreSQL
        migrated = 0
        for record in records:
            # Convert to dict, excluding id to let PostgreSQL auto-generate
            data = {
                c.name: getattr(record, c.name) 
                for c in record.__table__.columns 
                if c.name != 'id'
            }
            
            new_record = model_class(**data)
            postgres_session.add(new_record)
            migrated += 1
        
        postgres_session.commit()
        logger.info(f"  ✅ Successfully migrated {migrated}/{count} records")
        return True
        
    except Exception as e:
        postgres_session.rollback()
        logger.error(f"  ❌ Migration failed: {e}")
        return False

def verify_migration(sqlite_engine, postgres_engine):
    """Verify data integrity after migration"""
    logger.info("🔍 Verifying migration...")
    
    SqliteSession = sessionmaker(bind=sqlite_engine)
    PostgresSession = sessionmaker(bind=postgres_engine)
    
    sqlite_session = SqliteSession()
    postgres_session = PostgresSession()
    
    tables = [
        ("users", User),
        ("coaching_status", CoachingStatus),
        ("analyses", Analysis),
    ]
    
    all_good = True
    for table_name, model in tables:
        try:
            sqlite_count = sqlite_session.query(model).count()
            postgres_count = postgres_session.query(model).count()
            
            if sqlite_count == postgres_count:
                logger.info(f"  ✅ {table_name}: {postgres_count} records match")
            else:
                logger.error(f"  ❌ {table_name}: SQLite={sqlite_count}, PostgreSQL={postgres_count} - MISMATCH!")
                all_good = False
        except Exception as e:
            logger.error(f"  ❌ {table_name} verification failed: {e}")
            all_good = False
    
    sqlite_session.close()
    postgres_session.close()
    
    return all_good

def main():
    """Main migration flow"""
    logger.info("=" * 60)
    logger.info("🚀 PostgreSQL Migration Script")
    logger.info("=" * 60)
    
    # Safety check: Verify PostgreSQL URL
    if "sqlite" in settings.DATABASE_URL.lower():
        logger.error("❌ ERROR: DATABASE_URL still points to SQLite!")
        logger.error("Please update .env with PostgreSQL URL:")
        logger.error("DATABASE_URL=postgresql://user:password@host:5432/database")
        sys.exit(1)
    
    logger.info(f"Source: {SQLITE_URL}")
    logger.info(f"Target: {settings.DATABASE_URL[:50]}...")
    logger.info("")
    
    # Step 1: Backup
    logger.info("Step 1/4: Backing up SQLite database")
    backup_file = backup_sqlite()
    logger.info("")
    
    # Step 2: Create engines
    logger.info("Step 2/4: Creating database connections")
    try:
        sqlite_engine = create_engine(SQLITE_URL)
        postgres_engine = create_engine(settings.DATABASE_URL)
        logger.info("✅ Connections established")
    except Exception as e:
        logger.error(f"❌ Connection failed: {e}")
        sys.exit(1)
    logger.info("")
    
    # Step 3: Create schema and migrate
    logger.info("Step 3/4: Schema creation and data migration")
    if not create_postgres_schema(postgres_engine):
        logger.error("Schema creation failed. Aborting.")
        sys.exit(1)
    
    SqliteSession = sessionmaker(bind=sqlite_engine)
    PostgresSession = sessionmaker(bind=postgres_engine)
    
    sqlite_session = SqliteSession()
    postgres_session = PostgresSession()
    
    # Migrate tables in order (respecting foreign keys)
    tables_to_migrate = [
        ("users", User),
        ("coaching_status", CoachingStatus),
        ("analyses", Analysis),
    ]
    
    migration_success = True
    for table_name, model in tables_to_migrate:
        if not migrate_table(sqlite_session, postgres_session, table_name, model):
            migration_success = False
            break
    
    sqlite_session.close()
    postgres_session.close()
    
    if not migration_success:
        logger.error("❌ Migration failed. Check logs above.")
        sys.exit(1)
    
    logger.info("")
    
    # Step 4: Verify
    logger.info("Step 4/4: Verification")
    if verify_migration(sqlite_engine, postgres_engine):
        logger.info("")
        logger.info("=" * 60)
        logger.info("🎉 Migration completed successfully!")
        logger.info("=" * 60)
        if backup_file:
            logger.info(f"📦 Backup saved: {backup_file}")
        logger.info("")
        logger.info("Next steps:")
        logger.info("1. Test your application with PostgreSQL")
        logger.info("2. Run: pytest tests/backend/")
        logger.info("3. If all good, remove SQLite backup after 30 days")
        logger.info("")
    else:
        logger.error("")
        logger.error("=" * 60)
        logger.error("❌ Migration verification FAILED!")
        logger.error("=" * 60)
        logger.error("DO NOT use the PostgreSQL database yet.")
        logger.error(f"Restore from backup: {backup_file}")
        logger.error("")
        sys.exit(1)

if __name__ == "__main__":
    main()
