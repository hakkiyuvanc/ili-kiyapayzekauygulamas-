"""Database connection ve session yönetimi"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import QueuePool

from app.core.config import settings

# Database engine with optimized connection pooling
engine_kwargs = {
    "connect_args": {"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {},
}

# PostgreSQL-specific optimizations
if "postgresql" in settings.DATABASE_URL:
    engine_kwargs.update({
        "poolclass": QueuePool,
        "pool_size": 20,              # Number of persistent connections
        "max_overflow": 40,            # Additional connections when needed
        "pool_pre_ping": True,         # Verify connection health before use
        "pool_recycle": 3600,          # Recycle connections after 1 hour
        "pool_timeout": 30,            # Wait max 30s for connection
        "echo": False,                 # Disable SQL logging in production
    })

engine = create_engine(settings.DATABASE_URL, **engine_kwargs)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()


# Dependency
def get_db():
    """Database session dependency"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
