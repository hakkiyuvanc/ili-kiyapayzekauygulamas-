"""Pydantic Schemas for Relationship Analysis V2.0

Structured output schemas for comprehensive relationship reports
based on Gottman Method and scientific relationship psychology.
"""

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field


class GottmanComponent(BaseModel):
    """Gottman Method component score"""

    skor: int = Field(..., ge=0, le=100, description="Score 0-100")
    durum: Literal["Kritik", "Geliştirilmeli", "Orta", "İyi", "Mükemmel"] = Field(
        ..., description="Status category"
    )
    aciklama: str = Field(..., description="Brief explanation")


class GottmanMetrics(BaseModel):
    """Gottman's 7 Principles"""

    sevgi_haritalari: GottmanComponent = Field(..., description="Love Maps")
    hayranlik_paylasimi: GottmanComponent = Field(..., description="Fondness & Admiration")
    yakinlasma_cabalari: GottmanComponent = Field(..., description="Turn Towards")
    olumlu_perspektif: GottmanComponent = Field(..., description="Positive Perspective")
    catisma_yonetimi: GottmanComponent = Field(..., description="Manage Conflict")
    hayat_hayalleri: GottmanComponent = Field(..., description="Life Dreams")
    ortak_anlam: GottmanComponent = Field(..., description="Shared Meaning")


class EmotionalAnalysis(BaseModel):
    """Emotional tone analysis"""

    iletisim_tonu: str = Field(..., description="Communication tone")
    toksisite_seviyesi: int = Field(..., ge=0, le=100, description="Toxicity level 0-100")
    yakinlik: int = Field(..., ge=0, le=100, description="Intimacy level 0-100")
    duygu_ifadesi: str = Field(..., description="Emotion expression quality")


class DetectedPattern(BaseModel):
    """Detected communication pattern"""

    kalip: str = Field(..., description="Pattern name")
    ornekler: list[str] = Field(..., description="Example messages")
    frekans: Literal["Düşük", "Orta", "Yüksek"] = Field(..., description="Frequency")
    etki: Literal["Pozitif", "Nötr", "Negatif"] = Field(..., description="Impact on relationship")


class ActionRecommendation(BaseModel):
    """Actionable recommendation"""

    baslik: str = Field(..., description="Recommendation title")
    ornek_cumle: str = Field(..., description="Example sentence to use")
    oncelik: Literal["Düşük", "Orta", "Yüksek"] = Field(..., description="Priority level")
    kategori: str = Field(..., description="Category (e.g., Communication, Empathy)")


class MetaData(BaseModel):
    """Analysis metadata"""

    analiz_tarihi: datetime = Field(default_factory=datetime.now)
    model: str = Field(..., description="AI model used")
    mesaj_sayisi: int = Field(..., description="Number of messages analyzed")
    platform: str = Field(default="unknown", description="Message platform")


class GeneralScore(BaseModel):
    """Overall relationship health score"""

    iliskki_sagligi: int = Field(..., ge=0, le=100, description="Overall health 0-100")
    baskin_dinamik: str = Field(..., description="Dominant dynamic description")
    risk_seviyesi: Literal["Düşük", "Orta", "Yüksek", "Kritik"] = Field(
        ..., description="Risk level"
    )


class RelationshipReport(BaseModel):
    """Complete relationship analysis report (V2.0)"""

    meta_data: MetaData
    genel_karne: GeneralScore
    gottman_bilesenleri: GottmanMetrics
    duygusal_analiz: EmotionalAnalysis
    tespit_edilen_kaliplar: list[DetectedPattern] = Field(
        ..., max_items=10, description="Max 10 patterns"
    )
    aksiyon_onerileri: list[ActionRecommendation] = Field(
        ..., max_items=8, description="Max 8 recommendations"
    )
    ozel_notlar: list[str] = Field(
        default=[], description="Special notes or warnings"
    )


class AnalysisRequest(BaseModel):
    """Request for relationship analysis"""

    conversation_text: str = Field(..., min_length=50)
    model_preference: Literal["fast", "deep"] = Field(
        default="fast", description="fast=GPT-4o-mini, deep=Claude-3.5-Sonnet"
    )
    include_examples: bool = Field(
        default=True, description="Include example messages in patterns"
    )
