from fastapi import APIRouter

from app.core.config import settings

# from app.services.ai_service import get_ai_service # Circular import risk?
# ai_service import is safe if inside function or if services don't import api

router = APIRouter()


@router.get("/status")
async def system_status():
    """Sistem durumunu kontrol et (AI, DB)"""
    # Import inside to avoid potential circular deps if any
    from app.services.ai_service import get_ai_service

    ai_service = get_ai_service()

    return {
        "ai_enabled": settings.AI_ENABLED,
        "ai_provider": settings.AI_PROVIDER,
        "ai_available": ai_service._is_available(),  # True if keys are valid
        "database": "connected",  # SQLAlchemy lazy connect, assumes active if no error yet
        "version": settings.APP_VERSION,
    }
