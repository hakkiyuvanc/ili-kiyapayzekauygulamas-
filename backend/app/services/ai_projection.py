"""AI Projection Service - Gelecek Tahminleme

Mevcut iletişim kalıplarına göre ilişkinin 6 ay sonraki
durumunu tahmin eder ve olası senaryolar sunar.
"""

import logging
from typing import Any

from app.services.ai_service import get_ai_service

logger = logging.getLogger(__name__)


class AIProjection:
    """Future relationship projection service"""

    def __init__(self):
        self.ai_service = get_ai_service()

    def project_future(
        self,
        current_metrics: dict[str, Any],
        gottman_report: dict[str, Any] = None,
        timeframe_months: int = 6,
    ) -> dict[str, Any]:
        """
        İlişkinin gelecekteki durumunu tahmin et

        Args:
            current_metrics: Mevcut metrikler
            gottman_report: Gottman analiz raporu (opsiyonel)
            timeframe_months: Tahmin süresi (ay)

        Returns:
            Future projection with scenarios
        """
        if not self.ai_service._is_available():
            return self._fallback_projection(current_metrics, timeframe_months)

        try:
            # Projection prompt'u oluştur
            prompt = self._build_projection_prompt(
                current_metrics, gottman_report, timeframe_months
            )

            # AI'dan yanıt al
            response = self.ai_service._call_llm(prompt, max_tokens=1500)

            # Parse et
            projection = self._parse_projection_response(response)

            # Metriklerle zenginleştir
            projection["current_state"] = self._summarize_current_state(current_metrics)
            projection["timeframe_months"] = timeframe_months

            logger.info(
                "Future projection completed",
                extra={
                    "timeframe": timeframe_months,
                    "scenario_count": len(projection.get("scenarios", [])),
                },
            )

            return projection

        except Exception as e:
            logger.error(f"Future projection failed: {e}", exc_info=True)
            return self._fallback_projection(current_metrics, timeframe_months)

    def _build_projection_prompt(
        self,
        metrics: dict,
        gottman_report: dict,
        timeframe: int,
    ) -> str:
        """Gelecek tahmini prompt'u oluştur"""
        # Mevcut durum özeti
        sentiment_score = metrics.get("sentiment", {}).get("score", 50)
        empathy_score = metrics.get("empathy", {}).get("score", 50)
        conflict_score = metrics.get("conflict", {}).get("score", 50)

        # Gottman skorları
        gottman_health = 50
        if gottman_report:
            gottman_health = gottman_report.get("genel_karne", {}).get("iliskki_sagligi", 50)

        return f"""Sen bir İlişki Terapistisin ve gelecek tahminleri yapıyorsun.

MEVCUT DURUM:
- Duygu Skoru: {sentiment_score}/100
- Empati Skoru: {empathy_score}/100
- Çatışma Skoru: {conflict_score}/100
- Genel İlişki Sağlığı: {gottman_health}/100

GÖREV: Yukarıdaki metriklere göre, bu iletişim kalıpları devam ederse ilişkinin {timeframe} ay sonraki durumunu tahmin et.

3 SENARYO OLUŞTUR:
1. İYİMSER SENARYO: Eğer çiftler önerileri uygularsa
2. MEVCUT DURUM DEVAM EDERSE: Hiçbir şey değişmezse
3. KÖTÜMSER SENARYO: Sorunlar çözülmezse

Her senaryo için:
- Olasılık (%)
- İlişki durumu açıklaması
- Beklenen metrikler (0-100)
- Kritik dönüm noktaları
- Öneriler

JSON FORMATI:
{{
  "genel_tahmin": {{
    "risk_seviyesi": "<Düşük|Orta|Yüksek|Kritik>",
    "baskin_trend": "<İyileşiyor|Stabil|Kötüleşiyor>",
    "onemli_uyarilar": ["uyarı 1", "uyarı 2"]
  }},
  "senaryolar": [
    {{
      "tip": "İyimser",
      "olasilik": 40,
      "aciklama": "...",
      "beklenen_metrikler": {{
        "iliskki_sagligi": 75,
        "mutluluk": 80,
        "catisma": 20
      }},
      "kritik_noktalar": ["nokta 1", "nokta 2"],
      "oneriler": ["öneri 1", "öneri 2"]
    }},
    {{
      "tip": "Mevcut Durum",
      "olasilik": 40,
      "aciklama": "...",
      "beklenen_metrikler": {{...}},
      "kritik_noktalar": [...],
      "oneriler": [...]
    }},
    {{
      "tip": "Kötümser",
      "olasilik": 20,
      "aciklama": "...",
      "beklenen_metrikler": {{...}},
      "kritik_noktalar": [...],
      "oneriler": [...]
    }}
  ],
  "aksiyon_plani": {{
    "ilk_30_gun": ["aksiyon 1", "aksiyon 2"],
    "30_90_gun": ["aksiyon 1", "aksiyon 2"],
    "90_180_gun": ["aksiyon 1", "aksiyon 2"]
  }}
}}

Sadece JSON çıktısını ver."""

    def _parse_projection_response(self, response: str) -> dict[str, Any]:
        """AI yanıtını parse et"""
        import json

        try:
            # JSON'ı bul
            start = response.find("{")
            end = response.rfind("}") + 1
            if start != -1 and end > start:
                json_str = response[start:end]
                return json.loads(json_str)
        except Exception as e:
            logger.error(f"Projection parsing failed: {e}")

        return self._empty_projection()

    def _summarize_current_state(self, metrics: dict) -> dict[str, Any]:
        """Mevcut durumu özetle"""
        sentiment = metrics.get("sentiment", {}).get("score", 50)
        empathy = metrics.get("empathy", {}).get("score", 50)
        conflict = metrics.get("conflict", {}).get("score", 50)

        overall = (sentiment + empathy + (100 - conflict)) / 3

        return {
            "overall_health": round(overall, 2),
            "sentiment": sentiment,
            "empathy": empathy,
            "conflict": conflict,
            "status": "Sağlıklı" if overall >= 70 else "Orta" if overall >= 40 else "Riskli",
        }

    def _fallback_projection(self, metrics: dict, timeframe: int) -> dict[str, Any]:
        """AI yoksa basit tahmin"""
        current_state = self._summarize_current_state(metrics)
        overall_health = current_state["overall_health"]

        # Basit trend hesaplama
        if overall_health >= 70:
            trend = "İyileşiyor"
            risk = "Düşük"
        elif overall_health >= 40:
            trend = "Stabil"
            risk = "Orta"
        else:
            trend = "Kötüleşiyor"
            risk = "Yüksek"

        return {
            "current_state": current_state,
            "timeframe_months": timeframe,
            "genel_tahmin": {
                "risk_seviyesi": risk,
                "baskin_trend": trend,
                "onemli_uyarilar": [
                    "AI servisi kullanılamıyor, basit tahmin gösteriliyor",
                    "Daha detaylı analiz için AI API key'i ekleyin",
                ],
            },
            "senaryolar": [
                {
                    "tip": "İyimser",
                    "olasilik": 40,
                    "aciklama": "Öneriler uygulanırsa ilişki iyileşebilir",
                    "beklenen_metrikler": {
                        "iliskki_sagligi": min(overall_health + 20, 100),
                        "mutluluk": min(overall_health + 25, 100),
                        "catisma": max(current_state["conflict"] - 20, 0),
                    },
                    "kritik_noktalar": ["Düzenli iletişim", "Empati geliştirme"],
                    "oneriler": ["Haftalık kalite zamanı", "Aktif dinleme pratiği"],
                },
                {
                    "tip": "Mevcut Durum",
                    "olasilik": 40,
                    "aciklama": "Hiçbir şey değişmezse mevcut durum devam eder",
                    "beklenen_metrikler": {
                        "iliskki_sagligi": overall_health,
                        "mutluluk": overall_health,
                        "catisma": current_state["conflict"],
                    },
                    "kritik_noktalar": ["Statüko korunur", "Gelişim yok"],
                    "oneriler": ["Değişim için adım atın", "Profesyonel destek alın"],
                },
                {
                    "tip": "Kötümser",
                    "olasilik": 20,
                    "aciklama": "Sorunlar çözülmezse ilişki zorlanabilir",
                    "beklenen_metrikler": {
                        "iliskki_sagligi": max(overall_health - 20, 0),
                        "mutluluk": max(overall_health - 25, 0),
                        "catisma": min(current_state["conflict"] + 20, 100),
                    },
                    "kritik_noktalar": ["Artan çatışma", "Azalan bağ"],
                    "oneriler": ["Acil müdahale gerekli", "Terapi önerilir"],
                },
            ],
            "aksiyon_plani": {
                "ilk_30_gun": [
                    "Günlük 10 dakika kaliteli konuşma",
                    "Birbirinize teşekkür edin",
                ],
                "30_90_gun": [
                    "Haftalık bir aktivite birlikte yapın",
                    "Çatışma çözme tekniklerini öğrenin",
                ],
                "90_180_gun": [
                    "İlişki hedeflerinizi gözden geçirin",
                    "Gelişimi değerlendirin",
                ],
            },
        }

    def _empty_projection(self) -> dict[str, Any]:
        """Boş projection"""
        return {
            "current_state": {},
            "timeframe_months": 6,
            "genel_tahmin": {
                "risk_seviyesi": "Bilinmiyor",
                "baskin_trend": "Bilinmiyor",
                "onemli_uyarilar": ["Tahmin oluşturulamadı"],
            },
            "senaryolar": [],
            "aksiyon_plani": {},
        }


# Singleton
_ai_projection_instance = None


def get_ai_projection() -> AIProjection:
    """AI projection singleton"""
    global _ai_projection_instance
    if _ai_projection_instance is None:
        _ai_projection_instance = AIProjection()
    return _ai_projection_instance
