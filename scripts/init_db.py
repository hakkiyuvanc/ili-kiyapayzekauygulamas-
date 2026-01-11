"""Database initialization script"""

import sys

sys.path.insert(0, ".")

from backend.app.core.database import Base, engine


def init_db():
    """Create all database tables"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully!")


if __name__ == "__main__":
    init_db()
