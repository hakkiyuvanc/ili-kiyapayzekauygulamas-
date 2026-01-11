"""Redis cache service for performance optimization"""

try:
    import redis

    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False
    redis = None  # type: ignore

import json
import logging
from datetime import datetime, timedelta, timezone
from typing import Any, Optional

from app.core.config import settings

logger = logging.getLogger(__name__)


class CacheService:
    """Simple cache service with Redis (or in-memory fallback)"""

    def __init__(self):
        """Initialize Redis connection or fallback to dict"""
        self.enabled = False
        self.cache = {}  # In-memory fallback

        if not REDIS_AVAILABLE:
            logger.warning("⚠️ Redis module not installed, using in-memory cache")
            logger.info("💡 To install: pip install redis")
            self.redis_client = None
            return

        # Try Redis connection
        try:
            if hasattr(settings, "REDIS_URL") and settings.REDIS_URL:
                self.redis_client = redis.from_url(
                    settings.REDIS_URL, decode_responses=True, socket_connect_timeout=2
                )
                # Test connection
                self.redis_client.ping()
                self.enabled = True
                logger.info("✅ Redis cache enabled")
            else:
                logger.warning("⚠️ REDIS_URL not configured, using in-memory cache")
                self.redis_client = None
        except Exception as e:
            logger.warning(f"⚠️ Redis unavailable, using in-memory cache: {e}")
            self.redis_client = None

    def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        try:
            if self.redis_client:
                value = self.redis_client.get(key)
                if value:
                    return json.loads(value) if value != "null" else None
            else:
                # In-memory fallback
                item = self.cache.get(key)
                if item:
                    if item["expires_at"] > datetime.now(timezone.utc):
                        return item["value"]
                    else:
                        del self.cache[key]  # Expired
            return None
        except Exception as e:
            logger.error(f"Cache get error for key {key}: {e}")
            return None

    def set(self, key: str, value: Any, ttl_seconds: int = 300):
        """Set value in cache with TTL (default 5 minutes)"""
        try:
            if self.redis_client:
                self.redis_client.setex(key, ttl_seconds, json.dumps(value))
            else:
                # In-memory fallback
                self.cache[key] = {
                    "value": value,
                    "expires_at": datetime.now(timezone.utc) + timedelta(seconds=ttl_seconds),
                }
                # Simple cleanup: remove expired items if cache is too large
                if len(self.cache) > 1000:
                    self._cleanup_expired()
        except Exception as e:
            logger.error(f"Cache set error for key {key}: {e}")

    def delete(self, key: str):
        """Delete key from cache"""
        try:
            if self.redis_client:
                self.redis_client.delete(key)
            else:
                self.cache.pop(key, None)
        except Exception as e:
            logger.error(f"Cache delete error for key {key}: {e}")

    def _cleanup_expired(self):
        """Remove expired items from in-memory cache"""
        now = datetime.now(timezone.utc)
        expired_keys = [k for k, v in self.cache.items() if v["expires_at"] <= now]
        for key in expired_keys:
            del self.cache[key]
        logger.debug(f"Cleaned up {len(expired_keys)} expired cache entries")


# Singleton instance
cache_service = CacheService()
