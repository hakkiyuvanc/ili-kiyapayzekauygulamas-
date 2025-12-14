"""
Rate limiting configuration for API endpoints.
"""
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address, default_limits=["100/hour"])


def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    """Custom handler for rate limit exceeded."""
    return JSONResponse(
        status_code=429,
        content={
            "error": "Rate limit exceeded",
            "message": "Too many requests. Please try again later.",
            "retry_after": exc.detail
        }
    )


# Rate limit configurations for different endpoints
RATE_LIMITS = {
    "analysis": "10/minute",  # Analysis endpoints
    "upload": "5/minute",      # File upload endpoints
    "auth": "20/hour",         # Authentication endpoints
    "general": "100/hour"      # General endpoints
}
