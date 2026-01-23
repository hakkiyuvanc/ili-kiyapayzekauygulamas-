"""FastAPI Ana Uygulama"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from .api import feedback  # NEW
from .api import analysis, auth, chat, coaching, daily, stats, subscription, system, upload, users
from .core.config import settings
from .core.database import Base, engine
from .core.limiter import limiter
from .middleware.request_id import RequestIDMiddleware

# Modelleri import et ki Base.metadata dolusun
from .services.ai_service import get_ai_service


# Lifespan manager for startup events
@asynccontextmanager
async def lifespan(app: FastAPI):  # noqa: ARG001
    # Startup: Initialize logging
    from .core.logging import setup_logging

    setup_logging()

    # Startup: Initialize Sentry
    try:
        from .core.sentry import init_sentry

        init_sentry()
    except ImportError:
        print("⚠️ Sentry SDK not installed, skipping error tracking setup")

    # Startup: Tabloları oluştur
    Base.metadata.create_all(bind=engine)
    yield
    # Shutdown logic here if needed


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Yapay zeka destekli ilişki analizi API",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Rate Limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# Request ID Middleware
app.add_middleware(RequestIDMiddleware)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)

    # HSTS (HTTP Strict Transport Security)
    if settings.ENVIRONMENT == "production":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

    # Prevent clickjacking
    response.headers["X-Frame-Options"] = "DENY"

    # Prevent MIME type sniffing
    response.headers["X-Content-Type-Options"] = "nosniff"

    # XSS Protection
    response.headers["X-XSS-Protection"] = "1; mode=block"

    # Content Security Policy
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "script-src 'self'; "
        "style-src 'self' 'unsafe-inline'; "
        "img-src 'self' data: https:; "
        "font-src 'self' data:;"
    )

    # Referrer Policy
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

    # Permissions Policy
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"

    return response


@app.get("/", tags=["Health"])
async def root():
    """Ana endpoint - sağlık kontrolü"""
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "environment": settings.ENVIRONMENT,
        "docs": "/docs",
        "api": "/api/analysis",
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Detaylı sağlık kontrolü"""
    return JSONResponse(
        status_code=200,
        content={
            "status": "healthy",
            "service": "iliski-analiz-ai",
            "version": settings.APP_VERSION,
        },
    )


@app.get("/api/system/status", tags=["System"])
async def system_status():
    """Sistem durumunu kontrol et (AI, DB)"""
    ai_service = get_ai_service()

    return {
        "ai_enabled": settings.AI_ENABLED,
        "ai_provider": settings.AI_PROVIDER,
        "ai_available": ai_service._is_available(),  # True if keys are valid
        "database": "connected",  # SQLAlchemy lazy connect, assumes active if no error yet
        "version": settings.APP_VERSION,
    }


# API routers
app.include_router(system.router, prefix="/api/system", tags=["System"])
app.include_router(subscription.router, prefix="/api/subscription", tags=["Subscription"])
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["Analysis"])
app.include_router(upload.router, prefix="/api/upload", tags=["File Upload"])
app.include_router(chat.router, prefix="/api/chat", tags=["AI Coach"])
app.include_router(daily.router, prefix="/api/daily", tags=["Daily Pulse"])
app.include_router(stats.router, prefix="/api/stats", tags=["User Stats"])
app.include_router(coaching.router, prefix="/api/coaching", tags=["Coaching"])
app.include_router(feedback.router, prefix="/api/feedback", tags=["Feedback"])  # NEW


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )
