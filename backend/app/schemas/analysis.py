"""Pydantic Schemas - Request/Response modelleri"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime


# Analysis Request/Response
class AnalysisRequest(BaseModel):
    """Analiz isteği"""
    text: str = Field(..., min_length=10, max_length=50000, description="Analiz edilecek metin")
    format_type: str = Field(default="auto", description="Metin formatı: auto, whatsapp, simple, plain")
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
    metrics: Dict[str, Any] = Field(..., description="Metrikler")
    insights: List[Dict[str, str]] = Field(..., description="İçgörüler")
    recommendations: List[Dict[str, str]] = Field(..., description="Öneriler")
    generated_at: str = Field(..., description="Oluşturulma zamanı")


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
