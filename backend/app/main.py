"""FastAPI Ana Uygulama"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.app.core.config import settings
from backend.app.core.database import engine, Base
from backend.app.api import analysis, auth, upload
# Modelleri import et ki Base.metadata dolusun
from backend.app.models import database as models
from backend.app.services.ai_service import get_ai_service

# Lifespan manager for startup events
@asynccontextmanager
async def lifespan(app: FastAPI):
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
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
        "database": "connected", # SQLAlchemy lazy connect, assumes active if no error yet
        "version": settings.APP_VERSION
    }


# API routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["Analysis"])
app.include_router(upload.router, prefix="/api/upload", tags=["File Upload"])


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "backend.app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )
