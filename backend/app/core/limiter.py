
from slowapi import Limiter
from slowapi.util import get_remote_address
from fastapi import Request

def get_key_func(request: Request):
    """
    Rate limiting key function.
    Uses X-Forwarded-For if available (behind proxy), else remote address.
    """
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0]
    return request.client.host if request.client else "127.0.0.1"

# Initialize Limiter
limiter = Limiter(key_func=get_key_func)
