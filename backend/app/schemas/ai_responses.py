"""Pydantic models for AI service responses - Strict JSON Schema Enforcement"""

from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field


class InsightCategory(str, Enum):
    """Insight categories"""

    STRENGTH = "Güçlü Yön"
    IMPROVEMENT = "Gelişim Alanı"
    ATTENTION = "Dikkat Noktası"


class RecommendationCategory(str, Enum):
    """Recommendation categories"""

    COMMUNICATION = "İletişim"
    EMPATHY = "Empati"
    CONFLICT = "Çatışma Yönetimi"
    BONDING = "Bağ Güçlendirme"


class DifficultyLevel(str, Enum):
    """Difficulty level for recommendations"""

    LOW = "Düşük"
    MEDIUM = "Orta"
    HIGH = "Yüksek"


class Insight(BaseModel):
    """Single insight from AI analysis"""

    category: InsightCategory = Field(..., description="Insight category")
    title: str = Field(..., max_length=50, description="Short insight title")
    description: str = Field(
        ..., min_length=50, max_length=200, description="Detailed insight description"
    )
    icon: str = Field(default="💡", description="Emoji icon for the insight")

    class Config:
        json_schema_extra = {
            "example": {
                "category": "Güçlü Yön",
                "title": "Yüksek Empati Seviyesi",
                "description": "İletişimde karşınızı anlamaya yönelik güçlü çaba var. Bu, ilişkide güven ve yakınlık oluşturmanın temel taşıdır.",
                "icon": "💝",
            }
        }


class Recommendation(BaseModel):
    """Single recommendation from AI analysis"""

    category: RecommendationCategory = Field(..., description="Recommendation category")
    title: str = Field(..., max_length=50, description="Action-oriented title")
    description: str = Field(
        ..., min_length=50, max_length=200, description="Concrete actionable steps"
    )
    difficulty: DifficultyLevel = Field(
        default=DifficultyLevel.MEDIUM, description="Implementation difficulty"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "category": "İletişim",
                "title": "Günlük Check-in Rutini",
                "description": "Her gün 10 dakika telefonlar kapalı konuşun. Sadece dinleyin ve 'Anlıyorum' deyin.",
                "difficulty": "Düşük",
            }
        }


class GottmanComponent(BaseModel):
    """Single Gottman principle component"""

    skor: int = Field(..., ge=0, le=100, description="Score 0-100")
    durum: str = Field(
        ..., description="Status: Kritik|Geliştirilmeli|Orta|İyi|Mükemmel"
    )
    aciklama: str = Field(..., max_length=300, description="Explanation")


class GottmanMetrics(BaseModel):
    """Gottman's 7 Principles metrics"""

    sevgi_haritalari: GottmanComponent = Field(..., description="Love Maps")
    hayranlik_paylasimi: GottmanComponent = Field(..., description="Fondness & Admiration")
    yakinlasma_cabalari: GottmanComponent = Field(..., description="Turn Towards")
    olumlu_perspektif: GottmanComponent = Field(..., description="Positive Perspective")
    catisma_yonetimi: GottmanComponent = Field(..., description="Conflict Management")
    hayat_hayalleri: GottmanComponent = Field(..., description="Life Dreams")
    ortak_anlam: GottmanComponent = Field(..., description="Shared Meaning")


class EmotionalAnalysis(BaseModel):
    """Emotional tone analysis"""

    iletisim_tonu: str = Field(
        ..., description="Destekleyici|Nötr|Defansif|Saldırgan"
    )
    toksisite_seviyesi: int = Field(..., ge=0, le=100, description="Toxicity level")
    yakinlik: int = Field(..., ge=0, le=100, description="Intimacy level")
    duygu_ifadesi: str = Field(..., description="Açık|Kapalı|Karışık")


class DetectedPattern(BaseModel):
    """Communication pattern detected in conversation"""

    kalip: str = Field(..., max_length=50, description="Pattern name")
    ornekler: List[str] = Field(..., max_items=3, description="Example messages")
    frekans: str = Field(..., description="Düşük|Orta|Yüksek")
    etki: str = Field(..., description="Pozitif|Nötr|Negatif")


class ActionItem(BaseModel):
    """Actionable recommendation"""

    baslik: str = Field(..., max_length=50, description="Action title")
    ornek_cumle: str = Field(..., max_length=150, description="Example sentence to use")
    oncelik: str = Field(..., description="Düşük|Orta|Yüksek")
    kategori: str = Field(..., description="İletişim|Empati|Çatışma|Bağ")


class ChartDataPoint(BaseModel):
    """Single data point for charts"""
    
    label: str = Field(..., max_length=50, description="Data point label")
    value: float = Field(..., description="Numeric value")
    category: Optional[str] = Field(None, description="Optional category")


class ChartData(BaseModel):
    """Chart data for visualizations"""
    
    weekly_emotions: List[ChartDataPoint] = Field(
        default_factory=list, max_items=7, description="Weekly emotion trend"
    )
    gottman_radar: List[ChartDataPoint] = Field(
        default_factory=list, max_items=7, description="Gottman principles for radar chart"
    )


class LoveLanguage(str, Enum):
    """5 Love Languages"""
    
    WORDS_OF_AFFIRMATION = "Onaylayıcı Sözler"
    QUALITY_TIME = "Kaliteli Zaman"
    RECEIVING_GIFTS = "Hediye Almak"
    ACTS_OF_SERVICE = "Hizmet Eylemleri"
    PHYSICAL_TOUCH = "Fiziksel Temas"


class GeneralReport(BaseModel):
    """Overall relationship health report"""

    iliskki_sagligi: int = Field(..., ge=0, le=100, description="Overall health score")
    overall_score: float = Field(..., ge=0, le=10, description="Overall score 0-10 format")
    baskin_dinamik: str = Field(..., max_length=100, description="Dominant dynamic")
    risk_seviyesi: str = Field(..., description="Düşük|Orta|Yüksek|Kritik")
    love_language_guess: Optional[LoveLanguage] = Field(None, description="Predicted love language")
    red_flags: List[str] = Field(default_factory=list, max_items=5, description="Warning signs")
    positive_traits: List[str] = Field(default_factory=list, max_items=5, description="Positive aspects")


class RelationshipReport(BaseModel):
    """Complete relationship analysis report (V2.0 - Gottman-based)"""

    genel_karne: GeneralReport = Field(..., description="Overall report card")
    gottman_bilesenleri: GottmanMetrics = Field(..., description="Gottman components")
    duygusal_analiz: EmotionalAnalysis = Field(..., description="Emotional analysis")
    tespit_edilen_kaliplar: List[DetectedPattern] = Field(
        ..., max_items=5, description="Detected patterns"
    )
    aksiyon_onerileri: List[ActionItem] = Field(
        ..., max_items=6, description="Action recommendations"
    )
    ozel_notlar: List[str] = Field(
        default_factory=list, max_items=3, description="Special notes"
    )
    chart_data: Optional[ChartData] = Field(None, description="Data for charts and visualizations")

    class Config:
        json_schema_extra = {
            "example": {
                "genel_karne": {
                    "iliskki_sagligi": 72,
                    "baskin_dinamik": "Destekleyici ve empatik iletişim",
                    "risk_seviyesi": "Düşük",
                },
                "gottman_bilesenleri": {
                    "sevgi_haritalari": {
                        "skor": 75,
                        "durum": "İyi",
                        "aciklama": "Birbirinizi tanıma çabanız güçlü.",
                    }
                },
                "duygusal_analiz": {
                    "iletisim_tonu": "Destekleyici",
                    "toksisite_seviyesi": 15,
                    "yakinlik": 80,
                    "duygu_ifadesi": "Açık",
                },
                "tespit_edilen_kaliplar": [],
                "aksiyon_onerileri": [],
                "ozel_notlar": [],
            }
        }


class InsightsResponse(BaseModel):
    """Response model for insights generation"""

    insights: List[Insight] = Field(..., min_items=3, max_items=6)


class RecommendationsResponse(BaseModel):
    """Response model for recommendations generation"""

    recommendations: List[Recommendation] = Field(..., min_items=3, max_items=5)
