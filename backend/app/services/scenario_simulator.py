"""Scenario Simulator - Mesaj Tepki Tahmin Modülü

Bu modül, kullanıcının göndermek istediği mesaja karşı tarafın
olası tepkilerini tahmin eder (pozitif, nötr, negatif senaryolar).
"""

import json
import logging
from typing import Any

from app.services.ai_service import get_ai_service
from app.services.prompts import get_scenario_prompt

logger = logging.getLogger(__name__)


class ScenarioSimulator:
    """Mesaj senaryoları simülatörü"""

    def __init__(self):
        self.ai_service = get_ai_service()

    def simulate_response(
        self,
        proposed_message: str,
        partner_profile: dict[str, Any],
        relationship_context: dict[str, Any],
    ) -> dict[str, Any]:
        """
        Mesaja olası tepkileri simüle et

        Args:
            proposed_message: Kullanıcının göndermek istediği mesaj
            partner_profile: Karşı tarafın profili (geçmiş mesajlardan)
            relationship_context: İlişki bağlamı (analiz sonuçları)

        Returns:
            3 senaryo (pozitif, nötr, negatif) + genel öneri
        """
        if not self.ai_service._is_available():
            return self._fallback_simulation(proposed_message)

        try:
            # Prompt oluştur
            prompt = get_scenario_prompt(
                proposed_message, partner_profile, relationship_context
            )

            # AI'dan yanıt al
            response = self.ai_service._call_llm(prompt, max_tokens=1500)

            # Parse et
            result = self._parse_scenario_response(response)

            logger.info(
                "Scenario simulation completed",
                extra={
                    "message_length": len(proposed_message),
                    "scenarios_count": len(result.get("senaryolar", [])),
                },
            )

            return result

        except Exception as e:
            logger.error(
                "Scenario simulation failed",
                extra={"error": str(e)},
                exc_info=True,
            )
            return self._fallback_simulation(proposed_message)

    def analyze_message_tone(self, message: str) -> dict[str, Any]:
        """Mesajın tonunu analiz et"""
        # Basit keyword-based analiz
        positive_keywords = [
            "seviyorum",
            "özledim",
            "teşekkür",
            "harika",
            "mutlu",
            "❤️",
            "😊",
        ]
        negative_keywords = [
            "kızgın",
            "sinir",
            "bıktım",
            "yeter",
            "istemiyorum",
            "😡",
            "🤬",
        ]
        aggressive_keywords = ["asla", "hep", "hiç", "her zaman"]

        message_lower = message.lower()

        positive_count = sum(1 for kw in positive_keywords if kw in message_lower)
        negative_count = sum(1 for kw in negative_keywords if kw in message_lower)
        aggressive_count = sum(1 for kw in aggressive_keywords if kw in message_lower)

        if positive_count > negative_count:
            tone = "Pozitif"
        elif negative_count > positive_count:
            tone = "Negatif"
        else:
            tone = "Nötr"

        potential_triggers = []
        if aggressive_count > 0:
            potential_triggers.append("Genelleme ifadeleri (hep, asla, hiç)")
        if negative_count > 2:
            potential_triggers.append("Yoğun negatif dil")

        return {
            "ton": tone,
            "potansiyel_tetikleyiciler": potential_triggers,
            "guclu_yonler": (
                ["Olumlu ifadeler"] if positive_count > 0 else ["Sakin ton"]
            ),
        }

    def _parse_scenario_response(self, response: str) -> dict[str, Any]:
        """AI yanıtını parse et"""
        try:
            # JSON'ı bul
            start = response.find("{")
            end = response.rfind("}") + 1
            if start != -1 and end > start:
                json_str = response[start:end]
                result = json.loads(json_str)
                return result
        except Exception as e:
            logger.error(f"Scenario parsing failed: {e}")

        return self._fallback_simulation("")

    def _fallback_simulation(self, message: str) -> dict[str, Any]:
        """AI yoksa fallback senaryolar"""
        tone_analysis = self.analyze_message_tone(message)

        return {
            "mesaj_analizi": tone_analysis,
            "senaryolar": [
                {
                    "tip": "Pozitif",
                    "olasilik": "40%",
                    "yanit": "Anlıyorum, konuşalım. Senin için önemli olan her şey benim için de önemli.",
                    "duygusal_ton": "Açık ve destekleyici",
                    "iliskiye_etkisi": "İletişimi güçlendirir, yakınlık artabilir",
                    "onerilen_karsi_hamle": "Teşekkür edin ve konuşmayı yapıcı sürdürün",
                },
                {
                    "tip": "Nötr",
                    "olasilik": "40%",
                    "yanit": "Tamam, daha sonra konuşalım.",
                    "duygusal_ton": "Mesafeli ama sakin",
                    "iliskiye_etkisi": "Nötr, konuşma ertelenebilir",
                    "onerilen_karsi_hamle": "Sabırlı olun, uygun zamanı bekleyin",
                },
                {
                    "tip": "Negatif",
                    "olasilik": "20%",
                    "yanit": "Yine mi aynı şeyler? Bıktım bu konuşmalardan.",
                    "duygusal_ton": "Savunmacı ve gergin",
                    "iliskiye_etkisi": "Çatışma riski, mesafe artabilir",
                    "onerilen_karsi_hamle": "Sakin kalın, 'Ben dili' kullanın, suçlamaktan kaçının",
                },
            ],
            "genel_oneri": "Mesajınızı göndermeden önce tonunuzu gözden geçirin. 'Ben' dili kullanarak duygularınızı ifade edin.",
        }


# Singleton
_scenario_simulator_instance = None


def get_scenario_simulator() -> ScenarioSimulator:
    """Scenario simulator singleton"""
    global _scenario_simulator_instance
    if _scenario_simulator_instance is None:
        _scenario_simulator_instance = ScenarioSimulator()
    return _scenario_simulator_instance
