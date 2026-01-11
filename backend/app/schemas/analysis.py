"""Pydantic Schemas - Request/Response modelleri"""

from typing import Any, Optional

from pydantic import BaseModel, Field


# Analysis Request/Response
class AnalysisRequest(BaseModel):
    """Analiz isteği"""

    text: str = Field(..., min_length=10, max_length=50000, description="Analiz edilecek metin")
    format_type: str = Field(
        default="auto", description="Metin formatı: auto, whatsapp, simple, plain"
    )
    privacy_mode: bool = Field(default=True, description="PII maskeleme aktif mi")


class MetricResult(BaseModel):
    """Metrik sonucu"""

    score: float = Field(..., ge=0, le=100, description="Metrik skoru (0-100)")
    label: str = Field(..., description="Metrik etiketi")


class AnalysisResponse(BaseModel):
    """Analiz yanıtı"""

    status: str = Field(..., description="Analiz durumu")
    overall_score: float = Field(..., ge=0, le=100, description="Genel skor")
    summary: str = Field(..., description="Analiz özeti")
    metrics: dict[str, Any] = Field(..., description="Metrikler")
    conversation_stats: Optional[dict[str, Any]] = Field(
        default=None, description="Konuşma istatistikleri"
    )
    insights: list[dict[str, str]] = Field(..., description="İçgörüler")
    recommendations: list[dict[str, str]] = Field(..., description="Öneriler")
    reply_suggestions: Optional[list[str]] = Field(
        default=[], description="AI tarafından önerilen cevap seçenekleri"
    )
    generated_at: str = Field(..., description="Oluşturulma zamanı")
    analysis_id: Optional[int] = Field(default=None, description="Veritabanı ID")


class QuickScoreRequest(BaseModel):
    """Hızlı skor isteği"""

    text: str = Field(..., min_length=10, max_length=10000)


class QuickScoreResponse(BaseModel):
    """Hızlı skor yanıtı"""

    score: float = Field(..., ge=0, le=100)
    status: str = Field(default="success")


# Health Check
class HealthResponse(BaseModel):
    """Sağlık kontrolü yanıtı"""

    status: str = Field(default="healthy")
    service: str = Field(default="iliski-analiz-ai")
    version: str = Field(...)


# Error Response
class ErrorResponse(BaseModel):
    """Hata yanıtı"""

    status: str = Field(default="error")
    message: str = Field(...)
    detail: Optional[str] = None


class RewriteRequest(BaseModel):
    """Yeniden yazma isteği"""

    text: str = Field(..., min_length=1, max_length=1000, description="Dönüştürülecek metin")
    target_tone: str = Field(
        ..., description="Hedef ton: polite, professional, romantic, assertive"
    )


class RewriteResponse(BaseModel):
    """Yeniden yazma yanıtı"""

    original_text: str = Field(...)
    rewritten_text: str = Field(...)
    tone: str = Field(...)
