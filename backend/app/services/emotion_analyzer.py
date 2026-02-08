"""Emotion Spectrum Analysis - Satır Bazlı Duygu Analizi

Bu modül, her mesajın duygusal tonunu analiz eder ve zaman içindeki
duygu değişimlerini takip eder.
"""

import logging
from typing import Any

from app.services.ai_service import get_ai_service

logger = logging.getLogger(__name__)


class EmotionSpectrumAnalyzer:
    """Duygu spektrum analizi"""

    # Duygu kategorileri
    EMOTIONS = {
        "mutlu": {"keywords": ["mutlu", "sevindim", "harika", "güzel", "❤️", "😊", "🥰"], "score": 100},
        "heyecanli": {"keywords": ["heyecanlı", "muhteşem", "süper", "🎉", "✨"], "score": 90},
        "memnun": {"keywords": ["iyi", "güzel", "teşekkür", "sağol", "👍"], "score": 80},
        "notr": {"keywords": ["tamam", "olur", "anladım"], "score": 50},
        "uzgun": {"keywords": ["üzgün", "kötü", "mutsuz", "😢", "😔"], "score": 20},
        "kizgin": {"keywords": ["sinir", "kızgın", "bıktım", "yeter", "😡", "🤬"], "score": 10},
        "endiseli": {"keywords": ["endişe", "korku", "kaygı", "😰", "😟"], "score": 30},
    }

    def __init__(self):
        self.ai_service = get_ai_service()

    def analyze_message_emotions(self, messages: list[dict[str, Any]]) -> dict[str, Any]:
        """
        Her mesajın duygusal tonunu analiz et

        Args:
            messages: Mesaj listesi

        Returns:
            Duygu spektrum analizi
        """
        emotion_timeline = []
        emotion_distribution = {emotion: 0 for emotion in self.EMOTIONS.keys()}

        for msg in messages:
            content = msg.get("content", "").lower()
            sender = msg.get("sender", "Unknown")
            timestamp = msg.get("timestamp")

            # Basit keyword-based emotion detection
            detected_emotion = self._detect_emotion(content)
            emotion_score = self.EMOTIONS[detected_emotion]["score"]

            emotion_timeline.append(
                {
                    "timestamp": timestamp,
                    "sender": sender,
                    "emotion": detected_emotion,
                    "score": emotion_score,
                    "content_preview": content[:50],
                }
            )

            emotion_distribution[detected_emotion] += 1

        # İstatistikler
        total_messages = len(messages)
        avg_emotion_score = (
            sum(item["score"] for item in emotion_timeline) / total_messages
            if total_messages > 0
            else 50
        )

        # Duygu değişim trendi
        trend = self._calculate_emotion_trend(emotion_timeline)

        return {
            "emotion_timeline": emotion_timeline,
            "emotion_distribution": emotion_distribution,
            "average_emotion_score": round(avg_emotion_score, 2),
            "total_messages": total_messages,
            "trend": trend,
            "dominant_emotion": max(emotion_distribution, key=emotion_distribution.get),
        }

    def _detect_emotion(self, text: str) -> str:
        """Basit keyword matching ile duygu tespiti"""
        for emotion, data in self.EMOTIONS.items():
            for keyword in data["keywords"]:
                if keyword in text:
                    return emotion
        return "notr"

    def _calculate_emotion_trend(self, timeline: list[dict]) -> str:
        """Duygu trendi hesapla (iyileşiyor/kötüleşiyor/stabil)"""
        if len(timeline) < 5:
            return "yetersiz_veri"

        # İlk ve son %30'luk kısmı karşılaştır
        chunk_size = max(1, len(timeline) // 3)
        first_chunk = timeline[:chunk_size]
        last_chunk = timeline[-chunk_size:]

        avg_first = sum(item["score"] for item in first_chunk) / len(first_chunk)
        avg_last = sum(item["score"] for item in last_chunk) / len(last_chunk)

        diff = avg_last - avg_first

        if diff > 10:
            return "iyileşiyor"
        elif diff < -10:
            return "kötüleşiyor"
        else:
            return "stabil"

    def get_emotion_insights(self, analysis: dict[str, Any]) -> list[dict[str, str]]:
        """Duygu analizinden içgörüler çıkar"""
        insights = []

        # Dominant emotion insight
        dominant = analysis["dominant_emotion"]
        insights.append(
            {
                "category": "Duygu Analizi",
                "title": f"Baskın Duygu: {dominant.title()}",
                "description": f"Konuşmada en çok {dominant} duygusu hissediliyor.",
            }
        )

        # Trend insight
        trend = analysis["trend"]
        if trend == "iyileşiyor":
            insights.append(
                {
                    "category": "Güçlü Yön",
                    "title": "Olumlu Gelişim",
                    "description": "Zaman içinde duygusal ton iyileşiyor, bu olumlu bir işaret.",
                }
            )
        elif trend == "kötüleşiyor":
            insights.append(
                {
                    "category": "Dikkat Noktası",
                    "title": "Duygusal Gerilim",
                    "description": "Konuşma ilerledikçe duygusal ton düşüyor, dikkat gerekli.",
                }
            )

        return insights


# Singleton
_emotion_analyzer_instance = None


def get_emotion_analyzer() -> EmotionSpectrumAnalyzer:
    """Emotion analyzer singleton"""
    global _emotion_analyzer_instance
    if _emotion_analyzer_instance is None:
        _emotion_analyzer_instance = EmotionSpectrumAnalyzer()
    return _emotion_analyzer_instance
