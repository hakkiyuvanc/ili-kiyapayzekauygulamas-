"""Conversation Heatmap Service - Tansiyon Ölçer

Konuşmanın hangi saatlerde, hangi konularda (Para, Aile, Kıskançlık)
gerildiğini analiz eder ve sıcaklık haritası verisi üretir.
"""

import logging
import re
from collections import defaultdict
from datetime import datetime
from typing import Any

logger = logging.getLogger(__name__)


class ConversationHeatmap:
    """Conversation tension heatmap analyzer"""

    # Hassas konular ve tetikleyici kelimeler
    SENSITIVE_TOPICS = {
        "para": {
            "keywords": ["para", "borç", "kredi", "maaş", "harcama", "alışveriş", "fatura", "💰", "💸"],
            "weight": 1.5,
        },
        "aile": {
            "keywords": ["anne", "baba", "aile", "kayınvalide", "kayınpeder", "akraba"],
            "weight": 1.3,
        },
        "kiskanclik": {
            "keywords": ["kıskanç", "ex", "eski", "başkası", "kim", "nerede", "kimle"],
            "weight": 1.8,
        },
        "zaman": {
            "keywords": ["zaman", "vakit", "meşgul", "iş", "toplantı", "arkadaş"],
            "weight": 1.2,
        },
        "ev_isi": {
            "keywords": ["temizlik", "yemek", "bulaşık", "çamaşır", "ev işi"],
            "weight": 1.1,
        },
    }

    # Gerginlik göstergeleri
    TENSION_INDICATORS = [
        "ama", "yine", "hep", "asla", "hiç", "her zaman",
        "bıktım", "yeter", "sinir", "kızgın", "öfke",
        "😡", "🤬", "😤", "💢", "😠",
    ]

    def __init__(self):
        pass

    def analyze_heatmap(self, messages: list[dict[str, Any]]) -> dict[str, Any]:
        """
        Konuşmanın tansiyon haritasını oluştur

        Args:
            messages: Parsed message list

        Returns:
            Heatmap data with hourly tension, topic-based tension, peak moments
        """
        if not messages:
            return self._empty_heatmap()

        # Saatlik tansiyon
        hourly_tension = self._calculate_hourly_tension(messages)

        # Konu bazlı tansiyon
        topic_tension = self._calculate_topic_tension(messages)

        # Kritik anlar (en yüksek tansiyon)
        peak_moments = self._find_peak_moments(messages)

        # Genel tansiyon trendi
        tension_trend = self._calculate_tension_trend(messages)

        return {
            "hourly_tension": hourly_tension,
            "topic_tension": topic_tension,
            "peak_moments": peak_moments,
            "tension_trend": tension_trend,
            "overall_tension_score": self._calculate_overall_tension(hourly_tension),
        }

    def _calculate_hourly_tension(self, messages: list[dict]) -> list[dict]:
        """Saatlik tansiyon hesapla"""
        hourly_data = defaultdict(lambda: {"count": 0, "tension_sum": 0})

        for msg in messages:
            content = msg.get("content", "").lower()
            timestamp = msg.get("timestamp")

            # Timestamp'ten saat çıkar
            hour = self._extract_hour(timestamp)
            if hour is None:
                continue

            # Mesajın tansiyon skoru
            tension_score = self._calculate_message_tension(content)

            hourly_data[hour]["count"] += 1
            hourly_data[hour]["tension_sum"] += tension_score

        # Saatlik ortalama hesapla
        result = []
        for hour in range(24):
            if hour in hourly_data:
                avg_tension = hourly_data[hour]["tension_sum"] / hourly_data[hour]["count"]
            else:
                avg_tension = 0

            result.append({
                "hour": hour,
                "tension": round(avg_tension, 2),
                "message_count": hourly_data[hour]["count"],
            })

        return result

    def _calculate_topic_tension(self, messages: list[dict]) -> list[dict]:
        """Konu bazlı tansiyon hesapla"""
        topic_scores = defaultdict(lambda: {"count": 0, "tension_sum": 0})

        for msg in messages:
            content = msg.get("content", "").lower()

            # Her konu için kontrol et
            for topic, data in self.SENSITIVE_TOPICS.items():
                # Konu ile ilgili keyword var mı?
                if any(keyword in content for keyword in data["keywords"]):
                    tension = self._calculate_message_tension(content)
                    weighted_tension = tension * data["weight"]

                    topic_scores[topic]["count"] += 1
                    topic_scores[topic]["tension_sum"] += weighted_tension

        # Sonuçları formatla
        result = []
        for topic, scores in topic_scores.items():
            if scores["count"] > 0:
                avg_tension = scores["tension_sum"] / scores["count"]
                result.append({
                    "topic": topic,
                    "tension": round(avg_tension, 2),
                    "mention_count": scores["count"],
                    "risk_level": self._get_risk_level(avg_tension),
                })

        # En yüksek tansiyondan düşüğe sırala
        result.sort(key=lambda x: x["tension"], reverse=True)

        return result

    def _find_peak_moments(self, messages: list[dict]) -> list[dict]:
        """En yüksek tansiyonlu anları bul"""
        peak_moments = []

        for i, msg in enumerate(messages):
            content = msg.get("content", "").lower()
            tension = self._calculate_message_tension(content)

            # Yüksek tansiyon (>70)
            if tension > 70:
                # Bağlam için önceki ve sonraki mesajları al
                context_start = max(0, i - 2)
                context_end = min(len(messages), i + 3)
                context_messages = messages[context_start:context_end]

                peak_moments.append({
                    "timestamp": msg.get("timestamp"),
                    "sender": msg.get("sender"),
                    "content_preview": content[:100],
                    "tension_score": round(tension, 2),
                    "context": [
                        {
                            "sender": m.get("sender"),
                            "content": m.get("content", "")[:80],
                        }
                        for m in context_messages
                    ],
                })

        # En yüksek 5 anı döndür
        peak_moments.sort(key=lambda x: x["tension_score"], reverse=True)
        return peak_moments[:5]

    def _calculate_tension_trend(self, messages: list[dict]) -> str:
        """Tansiyon trendi (artıyor/azalıyor/stabil)"""
        if len(messages) < 10:
            return "yetersiz_veri"

        # İlk ve son %30'luk kısmı karşılaştır
        chunk_size = max(1, len(messages) // 3)
        first_chunk = messages[:chunk_size]
        last_chunk = messages[-chunk_size:]

        first_avg = sum(
            self._calculate_message_tension(m.get("content", ""))
            for m in first_chunk
        ) / len(first_chunk)

        last_avg = sum(
            self._calculate_message_tension(m.get("content", ""))
            for m in last_chunk
        ) / len(last_chunk)

        diff = last_avg - first_avg

        if diff > 15:
            return "artiyor"
        elif diff < -15:
            return "azaliyor"
        else:
            return "stabil"

    def _calculate_message_tension(self, content: str) -> float:
        """Tek bir mesajın tansiyon skorunu hesapla"""
        tension = 0

        # Gerginlik göstergeleri
        for indicator in self.TENSION_INDICATORS:
            if indicator in content:
                tension += 15

        # Büyük harf kullanımı (bağırma)
        if content.isupper() and len(content) > 5:
            tension += 25

        # Ünlem işareti
        tension += content.count("!") * 5

        # Soru işareti (çok fazla soru = kuşku)
        tension += min(content.count("?") * 3, 15)

        # Negatif emoji
        negative_emojis = ["😡", "🤬", "😤", "💢", "😠", "😔", "😢", "😭"]
        for emoji in negative_emojis:
            if emoji in content:
                tension += 20

        # 0-100 arasına normalize et
        return min(tension, 100)

    def _calculate_overall_tension(self, hourly_data: list[dict]) -> int:
        """Genel tansiyon skoru"""
        if not hourly_data:
            return 0

        total_tension = sum(h["tension"] for h in hourly_data if h["message_count"] > 0)
        active_hours = sum(1 for h in hourly_data if h["message_count"] > 0)

        if active_hours == 0:
            return 0

        return round(total_tension / active_hours)

    def _extract_hour(self, timestamp: str) -> int | None:
        """Timestamp'ten saat çıkar"""
        if not timestamp:
            return None

        try:
            # ISO format: 2024-01-15T14:30:00
            if "T" in timestamp:
                time_part = timestamp.split("T")[1]
                hour = int(time_part.split(":")[0])
                return hour
            # Simple format: 14:30
            elif ":" in timestamp:
                hour = int(timestamp.split(":")[0])
                return hour
        except Exception:
            pass

        return None

    def _get_risk_level(self, tension: float) -> str:
        """Tansiyon skorundan risk seviyesi"""
        if tension >= 70:
            return "Yüksek"
        elif tension >= 40:
            return "Orta"
        else:
            return "Düşük"

    def _empty_heatmap(self) -> dict:
        """Boş heatmap"""
        return {
            "hourly_tension": [{"hour": h, "tension": 0, "message_count": 0} for h in range(24)],
            "topic_tension": [],
            "peak_moments": [],
            "tension_trend": "yetersiz_veri",
            "overall_tension_score": 0,
        }


# Singleton
_heatmap_service_instance = None


def get_heatmap_service() -> ConversationHeatmap:
    """Heatmap service singleton"""
    global _heatmap_service_instance
    if _heatmap_service_instance is None:
        _heatmap_service_instance = ConversationHeatmap()
    return _heatmap_service_instance
