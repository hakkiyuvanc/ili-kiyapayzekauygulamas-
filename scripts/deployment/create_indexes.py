"""
Database Performance Optimization Script
Creates indexes for PostgreSQL after migration

Usage: python scripts/create_indexes.py
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / 'backend'))

from sqlalchemy import text
from app.core.database import engine
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

INDEXES = [
    # Users table
    ("idx_users_email", "CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);"),
    ("idx_users_stripe_customer", "CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON users(stripe_customer_id);"),
    
    # Analyses table
    ("idx_analyses_user_id", "CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON analyses(user_id);"),
    ("idx_analyses_created_at", "CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON analyses(created_at DESC);"),
    ("idx_analyses_overall_score", "CREATE INDEX IF NOT EXISTS idx_analyses_overall_score ON analyses(overall_score);"),
    
    # Coaching status table
    ("idx_coaching_user_id", "CREATE INDEX IF NOT EXISTS idx_coaching_user_id ON coaching_status(user_id);"),
]

def create_indexes():
    """Create performance indexes"""
    logger.info("🔧 Creating database indexes...")
    
    with engine.connect() as conn:
        for index_name, sql in INDEXES:
            try:
                conn.execute(text(sql))
                conn.commit()
                logger.info(f"  ✅ Created: {index_name}")
            except Exception as e:
                logger.warning(f"  ⚠️  {index_name}: {e}")
    
    logger.info("✅ Index creation complete")

if __name__ == "__main__":
    create_indexes()
