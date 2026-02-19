"""Sistem durumu ve AI yapılandırma endpoint'leri"""

import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.core.config import settings

router = APIRouter()


# ─────────────────────────────────────────────────────────────────────────────
# Şemalar
# ─────────────────────────────────────────────────────────────────────────────

VALID_PROVIDERS = {"openai", "anthropic", "gemini", "ollama", "none"}


class AIProviderUpdate(BaseModel):
    provider: str
    api_key: str = ""          # Cloud provider'lar için (opsiyonel)
    ollama_model: str = ""     # Ollama için model adı (opsiyonel)
    ollama_url: str = ""       # Ollama için base URL (opsiyonel)


# ─────────────────────────────────────────────────────────────────────────────
# Endpoint'ler
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/status")
async def system_status():
    """Sistem durumunu kontrol et (AI, DB, Ollama)"""
    from app.services.ai_service import get_ai_service

    ai_service = get_ai_service()

    # Ollama'nın çalışıp çalışmadığını da kontrol et
    ollama_running = False
    if settings.AI_PROVIDER == "ollama" or settings.OLLAMA_BASE_URL:
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                resp = await client.get(f"{settings.OLLAMA_BASE_URL}/api/tags")
                ollama_running = resp.status_code == 200
        except Exception:
            ollama_running = False

    return {
        "ai_enabled": settings.AI_ENABLED,
        "ai_provider": ai_service.provider,           # Singleton'dan oku (runtime değişebilir)
        "ai_available": ai_service._is_available(),
        "ollama_running": ollama_running,
        "ollama_url": settings.OLLAMA_BASE_URL,
        "ollama_model": settings.OLLAMA_MODEL,
        "database": "connected",
        "version": settings.APP_VERSION,
    }


@router.post("/ai-provider")
async def switch_ai_provider(payload: AIProviderUpdate):
    """
    Çalışma zamanında AI provider'ı değiştir.

    - Cloud provider'lar için API key gereklidir.
    - Ollama için API key gerekmez; sadece Ollama'nın çalışıyor olması yeterlidir.
    - Değişiklik sadece çalışır süreçte geçerlidir (.env dosyasını değiştirmez).
      Kalıcı yapmak için .env dosyasını manuel güncelleyin.
    """
    if payload.provider not in VALID_PROVIDERS:
        raise HTTPException(
            status_code=400,
            detail=f"Geçersiz provider: {payload.provider}. Desteklenenler: {VALID_PROVIDERS}",
        )

    from app.services.ai_service import get_ai_service

    ai_service = get_ai_service()

    try:
        result = ai_service.switch_provider(
            provider=payload.provider,
            api_key=payload.api_key or None,
            ollama_model=payload.ollama_model or None,
            ollama_url=payload.ollama_url or None,
        )
        return {
            "success": True,
            "provider": result["provider"],
            "available": result["available"],
            "message": result["message"],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/ollama/models")
async def list_ollama_models():
    """Ollama'da yüklü modelleri listele"""
    base_url = settings.OLLAMA_BASE_URL
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(f"{base_url}/api/tags")
            resp.raise_for_status()
            data = resp.json()
            models = [m["name"] for m in data.get("models", [])]
            return {"running": True, "models": models, "base_url": base_url}
    except httpx.ConnectError:
        return {"running": False, "models": [], "base_url": base_url,
                "hint": "Ollama çalışmıyor. `ollama serve` komutunu çalıştırın."}
    except Exception as e:
        return {"running": False, "models": [], "error": str(e)}
