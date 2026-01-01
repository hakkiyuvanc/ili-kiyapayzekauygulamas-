"""
Query Optimization Utility
Analyze and optimize slow queries

Usage: python scripts/optimize_queries.py
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / 'backend'))

from sqlalchemy import text
from app.core.database import engine
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def explain_query(query, params=None):
    """Run EXPLAIN ANALYZE on a query (PostgreSQL only)"""
    if "postgresql" not in str(engine.url):
        logger.warning("EXPLAIN ANALYZE only available for PostgreSQL")
        return
    
    explain_query = f"EXPLAIN ANALYZE {query}"
    
    with engine.connect() as conn:
        result = conn.execute(text(explain_query), params or {})
        logger.info("\nQuery Plan:")
        for row in result:
            logger.info(f"  {row[0]}")

def analyze_slow_queries():
    """Analyze common slow queries"""
    logger.info("🔍 Analyzing Common Queries")
    logger.info("=" * 60)
    
    # Common queries to analyze
    queries = [
        {
            "name": "User authentication",
            "sql": "SELECT * FROM users WHERE email = :email",
            "params": {"email": "test@example.com"},
            "recommendation": "Index on email column (already created)"
        },
        {
            "name": "User analyses history",
            "sql": "SELECT * FROM analyses WHERE user_id = :user_id ORDER BY created_at DESC LIMIT 20",
            "params": {"user_id": 1},
            "recommendation": "Composite index on (user_id, created_at DESC)"
        },
        {
            "name": "Recent analyses",
            "sql": "SELECT * FROM analyses ORDER BY created_at DESC LIMIT 10",
            "params": {},
            "recommendation": "Index on created_at DESC (already created)"
        }
    ]
    
    for q in queries:
        logger.info(f"\n📊 {q['name']}")
        logger.info(f"Query: {q['sql']}")
        logger.info(f"💡 Recommendation: {q['recommendation']}")
        
        if "postgresql" in str(engine.url):
            explain_query(q['sql'], q['params'])

def create_missing_indexes():
    """Create additional performance indexes"""
    logger.info("\n🔧 Creating Additional Indexes")
    logger.info("=" * 60)
    
    additional_indexes = [
        # Composite indexes for common queries
        ("idx_analyses_user_created", 
         "CREATE INDEX IF NOT EXISTS idx_analyses_user_created ON analyses(user_id, created_at DESC);"),
        
        # Partial indexes for active users
        ("idx_users_active_email",
         "CREATE INDEX IF NOT EXISTS idx_users_active_email ON users(email) WHERE is_active = true;"),
        
        # Index for subscription queries
        ("idx_users_pro",
         "CREATE INDEX IF NOT EXISTS idx_users_pro ON users(is_pro) WHERE is_pro = true;"),
    ]
    
    with engine.connect() as conn:
        for name, sql in additional_indexes:
            try:
                conn.execute(text(sql))
                conn.commit()
                logger.info(f"  ✅ Created: {name}")
            except Exception as e:
                logger.warning(f"  ⚠️ {name}: {str(e)[:50]}")

def vacuum_analyze():
    """Run VACUUM ANALYZE (PostgreSQL only)"""
    if "postgresql" not in str(engine.url):
        logger.warning("VACUUM only available for PostgreSQL")
        return
    
    logger.info("\n🧹 Running VACUUM ANALYZE")
    logger.info("=" * 60)
    
    with engine.connect() as conn:
        conn.execution_options(isolation_level="AUTOCOMMIT")
        conn.execute(text("VACUUM ANALYZE;"))
        logger.info("✅ VACUUM ANALYZE complete")

def main():
    """Main optimization function"""
    logger.info("DATABASE QUERY OPTIMIZATION")
    logger.info("=" * 60)
    
    # Analyze queries
    analyze_slow_queries()
    
    # Create additional indexes
    create_missing_indexes()
    
    # Vacuum (PostgreSQL)
    if "postgresql" in str(engine.url):
        vacuum_analyze()
    
    logger.info("\n✅ Optimization complete")
    logger.info("\nNext steps:")
    logger.info("1. Monitor query performance: python scripts/monitor_db_performance.py")
    logger.info("2. Review slow query logs")
    logger.info("3. Adjust connection pool if needed")

if __name__ == "__main__":
    main()
