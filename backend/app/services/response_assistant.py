"""Yanıt Asistanı Servisi (Response Assistant / Shadowing)

Kullanıcı bir mesaj gönderir, AI 3 farklı tonda alternatif yanıt üretir:
- Yapıcı/Onarıcı: Empati odaklı, çatışmayı azaltan
- Sınır Koyucu: Net, saygılı, kendini ifade eden
- Flörtöz/Romantik: Sıcak, bağ kuran, sevgi dolu
"""

import json
import logging
from typing import Any

logger = logging.getLogger(__name__)


TONE_DEFINITIONS = {
    "yapici": {
        "label": "Yapıcı & Onarıcı",
        "emoji": "🤝",
        "description": "Empati kurar, çatışmayı azaltır, ortak zemin arar",
        "color": "#4CAF50",
        "instruction": (
            "Empati ve anlayış odaklı. Karşı tarafın duygularını kabul et, "
            "savunmacı olmadan yanıt ver, ortak çözüm öner. "
            "Yumuşak ama net ol."
        ),
    },
    "sinir": {
        "label": "Sınır Koyucu",
        "emoji": "🛡️",
        "description": "Net, saygılı, kendini ifade eden, sınırları koruyan",
        "color": "#FF9800",
        "instruction": (
            "Saygılı ama net sınırlar koy. Kendini açıkça ifade et, "
            "suçlamadan ihtiyaçlarını belirt. "
            "Güçlü ama saldırgan değil."
        ),
    },
    "romantik": {
        "label": "Romantik & Bağ Kurucu",
        "emoji": "💕",
        "description": "Sıcak, sevgi dolu, bağı güçlendiren",
        "color": "#E91E63",
        "instruction": (
            "Sıcak, sevgi dolu ve bağ kurucu bir ton kullan. "
            "Duygusal yakınlık yarat, partnerini özel hissettir. "
            "Romantik ama samimi ol."
        ),
    },
}


class ResponseGenerator:
    """
    Bir gelen mesaja karşı 3 farklı tonda yanıt üretir.
    """

    def generate(
        self,
        received_message: str,
        context: str = "",
        ai_service=None,
    ) -> dict[str, Any]:
        """
        3 farklı tonda yanıt üret.

        Args:
            received_message: Partnerden gelen mesaj
            context: Opsiyonel bağlam (ilişki durumu, önceki konuşma vb.)
            ai_service: AIService instance

        Returns:
            {
              "received_message": str,
              "responses": [
                {"tone": "yapici", "label": ..., "emoji": ..., "response": ..., "color": ...},
                ...
              ],
              "ai_generated": bool,
            }
        """
        if ai_service and ai_service._is_available():
            try:
                responses = self._generate_with_llm(received_message, context, ai_service)
                return {
                    "received_message": received_message,
                    "responses": responses,
                    "ai_generated": True,
                }
            except Exception as e:
                logger.warning(f"LLM response generation failed, using fallback: {e}")

        # Fallback: kural tabanlı yanıtlar
        responses = self._generate_fallback(received_message)
        return {
            "received_message": received_message,
            "responses": responses,
            "ai_generated": False,
        }

    def _generate_with_llm(
        self,
        received_message: str,
        context: str,
        ai_service,
    ) -> list[dict[str, Any]]:
        """LLM ile 3 tonda yanıt üret"""

        context_section = f"\nİLİŞKİ BAĞLAMI: {context}" if context else ""

        prompt = f"""Sen bir ilişki koçusun. Aşağıdaki mesaja 3 farklı tonda yanıt yaz.

GELEN MESAJ: "{received_message}"{context_section}

Her yanıt kısa (1-3 cümle), doğal ve Türkçe olmalı.

Şu JSON formatında yanıt ver:
{{
  "yapici": "Empati odaklı, onarıcı yanıt buraya",
  "sinir": "Net sınır koyan, saygılı yanıt buraya",
  "romantik": "Sıcak, romantik, bağ kurucu yanıt buraya"
}}

Sadece JSON döndür, başka açıklama ekleme."""

        raw = ai_service._call_llm(prompt=prompt, max_tokens=400, temperature=0.8)

        # JSON parse
        start = raw.find("{")
        end = raw.rfind("}") + 1
        if start == -1 or end <= start:
            raise ValueError(f"No JSON found in LLM response: {raw[:200]}")

        data = json.loads(raw[start:end])

        responses = []
        for tone_key, meta in TONE_DEFINITIONS.items():
            response_text = data.get(tone_key, "")
            if response_text:
                responses.append(
                    {
                        "tone": tone_key,
                        "label": meta["label"],
                        "emoji": meta["emoji"],
                        "description": meta["description"],
                        "response": response_text,
                        "color": meta["color"],
                    }
                )

        return responses

    def _generate_fallback(self, received_message: str) -> list[dict[str, Any]]:
        """AI olmadan basit kural tabanlı yanıtlar"""
        msg_lower = received_message.lower()

        # Detect message type
        is_accusation = any(w in msg_lower for w in ["neden", "niye", "hiç", "asla", "hep"])
        is_distance = any(w in msg_lower for w in ["bırak", "rahat", "meşgul", "sonra"])
        is_longing = any(w in msg_lower for w in ["özledim", "görüşelim", "neredesin", "ne zaman"])

        if is_accusation:
            yapici = "Seni duyuyorum ve bu konuşmayı yapmak istiyorum. Şu an nasıl hissettirdiğimi anlat, birlikte çözelim."
            sinir = "Bu konuyu konuşmaya hazırım, ama sakin bir ortamda. Şu an müsait değilim, akşam konuşalım mı?"
            romantik = "Seni çok önemsiyorum, bu yüzden bu konuyu düzgünce konuşmak istiyorum. Seninle her şeyi çözebiliriz 💕"
        elif is_distance:
            yapici = "Anladım, biraz alana ihtiyacın var. Hazır olduğunda buradayım."
            sinir = "Tamam, zaman tanıyorum. Ama bu konuyu ertelemeden konuşmamız gerekiyor."
            romantik = "Seni zorlamamak istiyorum, ama özlüyorum. Hazır olduğunda gel, sarılmak istiyorum 🤗"
        elif is_longing:
            yapici = "Ben de özledim! Hemen bir zaman ayarlayalım, seninle vakit geçirmek güzel."
            sinir = "Evet, görüşelim. Bu hafta sonu uygun musun?"
            romantik = "Seni çok özledim! Hemen arıyorum, sesini duymak istiyorum 💖"
        else:
            yapici = (
                "Seni duyuyorum. Bunu benimle paylaştığın için teşekkür ederim, birlikte düşünelim."
            )
            sinir = "Anladım. Bu konuda net olmak istiyorum: benim için önemli olan şu..."
            romantik = "Seninle konuşmak her zaman güzel 💕 Bunu benimle paylaştığın için mutluyum."

        return [
            {
                "tone": "yapici",
                "label": TONE_DEFINITIONS["yapici"]["label"],
                "emoji": TONE_DEFINITIONS["yapici"]["emoji"],
                "description": TONE_DEFINITIONS["yapici"]["description"],
                "response": yapici,
                "color": TONE_DEFINITIONS["yapici"]["color"],
            },
            {
                "tone": "sinir",
                "label": TONE_DEFINITIONS["sinir"]["label"],
                "emoji": TONE_DEFINITIONS["sinir"]["emoji"],
                "description": TONE_DEFINITIONS["sinir"]["description"],
                "response": sinir,
                "color": TONE_DEFINITIONS["sinir"]["color"],
            },
            {
                "tone": "romantik",
                "label": TONE_DEFINITIONS["romantik"]["label"],
                "emoji": TONE_DEFINITIONS["romantik"]["emoji"],
                "description": TONE_DEFINITIONS["romantik"]["description"],
                "response": romantik,
                "color": TONE_DEFINITIONS["romantik"]["color"],
            },
        ]


# ---------------------------------------------------------------------------
# Singleton
# ---------------------------------------------------------------------------

_response_generator_instance = None


def get_response_generator() -> ResponseGenerator:
    """ResponseGenerator singleton"""
    global _response_generator_instance
    if _response_generator_instance is None:
        _response_generator_instance = ResponseGenerator()
    return _response_generator_instance
