"""Request ID Middleware

Generates and tracks unique request IDs for distributed tracing.
"""

import uuid

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp

from app.core.logging import request_id_var


class RequestIDMiddleware(BaseHTTPMiddleware):
    """Middleware to generate and track request IDs"""

    def __init__(self, app: ASGIApp):
        super().__init__(app)

    async def dispatch(self, request: Request, call_next):
        # Generate or extract request ID
        request_id = request.headers.get("X-Request-ID")
        if not request_id:
            request_id = str(uuid.uuid4())

        # Store in context variable for logging
        request_id_var.set(request_id)

        # Store in request state for access in endpoints
        request.state.request_id = request_id

        # Process request
        response: Response = await call_next(request)

        # Add request ID to response headers
        response.headers["X-Request-ID"] = request_id

        return response
