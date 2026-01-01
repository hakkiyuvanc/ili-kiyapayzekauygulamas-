"""
Database Performance Monitoring Script
Monitors query performance, connection pool, and identifies slow queries

Usage: python scripts/monitor_db_performance.py
"""

import sys
from pathlib import Path
from datetime import datetime, timedelta
import time

sys.path.insert(0, str(Path(__file__).parent.parent / 'backend'))

from sqlalchemy import text, event
from app.core.database import engine, SessionLocal
from app.models.database import User, Analysis
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class DatabaseMonitor:
    """Database performance monitoring utilities"""
    
    def __init__(self):
        self.slow_query_threshold = 0.1  # 100ms
        
    def check_connection_pool(self):
        """Monitor connection pool status"""
        logger.info("🔍 Connection Pool Status")
        logger.info("=" * 60)
        
        pool = engine.pool
        logger.info(f"Pool size: {pool.size()}")
        logger.info(f"Checked out connections: {pool.checkedout()}")
        logger.info(f"Overflow: {pool.overflow()}")
        logger.info(f"Checked in connections: {pool.checkedin()}")
        
        # Pool configuration
        logger.info(f"\nConfiguration:")
        logger.info(f"Max pool size: {engine.pool._pool.maxsize if hasattr(engine.pool, '_pool') else 'N/A'}")
        logger.info(f"Max overflow: {engine.pool._max_overflow if hasattr(engine.pool, '_max_overflow') else 'N/A'}")
        
        return {
            "size": pool.size(),
            "checked_out": pool.checkedout(),
            "overflow": pool.overflow()
        }
    
    def analyze_query_performance(self):
        """Analyze common query performance"""
        logger.info("\n📊 Query Performance Analysis")
        logger.info("=" * 60)
        
        queries = [
            ("User lookup by email", "SELECT * FROM users WHERE email = :email LIMIT 1", {"email": "test@example.com"}),
            ("Recent analyses by user", "SELECT * FROM analyses WHERE user_id = :user_id ORDER BY created_at DESC LIMIT 10", {"user_id": 1}),
            ("User count", "SELECT COUNT(*) FROM users", {}),
            ("Analysis count", "SELECT COUNT(*) FROM analyses", {}),
        ]
        
        results = []
        with engine.connect() as conn:
            for name, query, params in queries:
                start = time.time()
                try:
                    result = conn.execute(text(query), params)
                    result.fetchall()  # Ensure full execution
                    elapsed = time.time() - start
                    
                    status = "✅" if elapsed < self.slow_query_threshold else "⚠️ SLOW"
                    logger.info(f"{status} {name}: {elapsed*1000:.2f}ms")
                    
                    results.append({
                        "query": name,
                        "time_ms": elapsed * 1000,
                        "is_slow": elapsed > self.slow_query_threshold
                    })
                except Exception as e:
                    logger.error(f"❌ {name} failed: {e}")
        
        return results
    
    def check_table_sizes(self):
        """Check table sizes (PostgreSQL only)"""
        logger.info("\n📦 Table Sizes")
        logger.info("=" * 60)
        
        if "postgresql" not in str(engine.url):
            logger.info("⚠️ Table size check only available for PostgreSQL")
            return
        
        query = text("""
            SELECT 
                schemaname,
                tablename,
                pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
                pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
            FROM pg_tables
            WHERE schemaname = 'public'
            ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
        """)
        
        with engine.connect() as conn:
            result = conn.execute(query)
            for row in result:
                logger.info(f"  {row[1]}: {row[2]}")
    
    def check_indexes(self):
        """Check existing indexes (PostgreSQL only)"""
        logger.info("\n🔍 Database Indexes")
        logger.info("=" * 60)
        
        if "postgresql" not in str(engine.url):
            logger.info("⚠️ Index check only available for PostgreSQL")
            return
        
        query = text("""
            SELECT
                tablename,
                indexname,
                indexdef
            FROM pg_indexes
            WHERE schemaname = 'public'
            ORDER BY tablename, indexname;
        """)
        
        with engine.connect() as conn:
            result = conn.execute(query)
            current_table = None
            for row in result:
                if row[0] != current_table:
                    current_table = row[0]
                    logger.info(f"\n📋 {current_table}:")
                logger.info(f"  ✅ {row[1]}")
    
    def suggest_optimizations(self, query_results):
        """Suggest optimizations based on results"""
        logger.info("\n💡 Optimization Suggestions")
        logger.info("=" * 60)
        
        slow_queries = [r for r in query_results if r["is_slow"]]
        
        if not slow_queries:
            logger.info("✅ All queries performing well!")
            return
        
        logger.info(f"Found {len(slow_queries)} slow queries:")
        for q in slow_queries:
            logger.info(f"  ⚠️ {q['query']}: {q['time_ms']:.2f}ms")
        
        logger.info("\nRecommendations:")
        logger.info("1. Run: python scripts/create_indexes.py")
        logger.info("2. Review query plans with EXPLAIN ANALYZE")
        logger.info("3. Consider adding composite indexes")
        logger.info("4. Check connection pool settings")
    
    def run_full_report(self):
        """Run complete performance report"""
        logger.info("\n" + "=" * 60)
        logger.info("DATABASE PERFORMANCE REPORT")
        logger.info(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        logger.info("=" * 60)
        
        # Connection pool
        pool_stats = self.check_connection_pool()
        
        # Query performance
        query_results = self.analyze_query_performance()
        
        # Table sizes
        self.check_table_sizes()
        
        # Indexes
        self.check_indexes()
        
        # Suggestions
        self.suggest_optimizations(query_results)
        
        logger.info("\n" + "=" * 60)
        logger.info("Report Complete")
        logger.info("=" * 60)

def main():
    """Main monitoring function"""
    monitor = DatabaseMonitor()
    monitor.run_full_report()

if __name__ == "__main__":
    main()
