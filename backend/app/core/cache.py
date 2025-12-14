"""
Caching utilities for API responses and computations.
"""
from functools import wraps
import json
import hashlib
from typing import Any, Optional
import redis
from backend.app.core.config import settings

# Initialize Redis client (optional - falls back to memory cache if Redis not available)
try:
    redis_client = redis.Redis(
        host=getattr(settings, 'REDIS_HOST', 'localhost'),
        port=getattr(settings, 'REDIS_PORT', 6379),
        db=0,
        decode_responses=True
    )
    redis_client.ping()
    REDIS_AVAILABLE = True
except:
    REDIS_AVAILABLE = False
    # Fallback to simple dict cache
    _memory_cache = {}


class Cache:
    """Simple cache wrapper that supports both Redis and memory."""
    
    @staticmethod
    def get(key: str) -> Optional[Any]:
        """Get value from cache."""
        if REDIS_AVAILABLE:
            value = redis_client.get(key)
            if value:
                return json.loads(value)
        else:
            return _memory_cache.get(key)
        return None
    
    @staticmethod
    def set(key: str, value: Any, ttl: int = 3600):
        """Set value in cache with TTL in seconds."""
        serialized = json.dumps(value)
        if REDIS_AVAILABLE:
            redis_client.setex(key, ttl, serialized)
        else:
            _memory_cache[key] = value
    
    @staticmethod
    def delete(key: str):
        """Delete value from cache."""
        if REDIS_AVAILABLE:
            redis_client.delete(key)
        else:
            _memory_cache.pop(key, None)
    
    @staticmethod
    def clear():
        """Clear all cache."""
        if REDIS_AVAILABLE:
            redis_client.flushdb()
        else:
            _memory_cache.clear()


def cache_key(*args, **kwargs) -> str:
    """Generate cache key from arguments."""
    key_data = json.dumps({'args': args, 'kwargs': kwargs}, sort_keys=True)
    return hashlib.md5(key_data.encode()).hexdigest()


def cached(ttl: int = 3600):
    """Decorator to cache function results."""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Generate cache key
            key = f"{func.__name__}:{cache_key(*args, **kwargs)}"
            
            # Try to get from cache
            cached_value = Cache.get(key)
            if cached_value is not None:
                return cached_value
            
            # Compute and cache
            result = func(*args, **kwargs)
            Cache.set(key, result, ttl)
            return result
        return wrapper
    return decorator
