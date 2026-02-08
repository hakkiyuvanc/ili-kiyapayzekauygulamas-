"""Pydantic Schemas for Relationship Analysis V2.0

Structured output schemas for comprehensive relationship reports
based on Gottman Method and scientific relationship psychology.
"""

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

    iletisim_tonu: str = Field(..., description="Communication tone (e.g., 'Defensive', 'Open')")
    toksisite_seviyesi: int = Field(..., ge=0, le=100, description="Toxicity level 0-100")
    yakinlik: int = Field(..., ge=0, le=100, description="Intimacy level 0-100")
    duygu_ifadesi: str = Field(..., description="Emotion expression quality")
    empati_puani: int = Field(..., ge=0, le=100, description="Empathy score 0-100")


class DetectedPattern(BaseModel):
    """Detected communication pattern"""

    kalip: str = Field(..., description="Pattern name")
    ornekler: list[str] = Field(..., max_items=3, description="Max 3 example messages")
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

    analiz_tarihi: str
    model: str
    mesaj_sayisi: int
    platform: str


class GeneralScore(BaseModel):
    """Overall relationship score card"""

    iliskki_sagligi: int = Field(..., ge=0, le=100)
    baskin_dinamik: str
    risk_seviyesi: Literal["Düşük", "Orta", "Yüksek", "Kritik"]


class RelationshipReport(BaseModel):
    """Complete relationship analysis report (V2.0)"""

    meta_data: MetaData
    genel_karne: GeneralScore
    gottman_bilesenleri: GottmanMetrics
    duygusal_analiz: EmotionalAnalysis
    tespit_edilen_kaliplar: list[DetectedPattern] = Field(
        ..., max_items=5, description="Top 5 patterns"
    )
    aksiyon_onerileri: list[ActionRecommendation] = Field(
        ..., max_items=5, description="Top 5 recommendations"
    )
    ozel_notlar: list[str] = Field(default=[], max_items=3, description="Max 3 special notes")


class AnalysisRequest(BaseModel):
    """Request for relationship analysis"""

    conversation_text: str = Field(..., min_length=50)
    model_preference: Literal["fast", "deep"] = Field(
        default="fast", description="fast=GPT-4o-mini, deep=Claude-3.5-Sonnet"
    )
    include_examples: bool = Field(default=True, description="Include example messages in patterns")


class V2AnalysisResult(BaseModel):
    """V2 Analysis Response"""

    status: str
    version: str
    gottman_report: RelationshipReport
    basic_metrics: dict[str, Any] = None
    summary: str = None
    heatmap: dict[str, Any] = None
    analysis_id: int = None
