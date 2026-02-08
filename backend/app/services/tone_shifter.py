"""Tone Shifter Service - Mesaj Düzenleyici

Kullanıcının öfkeli veya agresif mesajını daha yapıcı, empatik
bir tona dönüştürür. AI-powered message rewriting.
"""

import logging
from typing import Any

from app.services.ai_service import get_ai_service

logger = logging.getLogger(__name__)


class ToneShifter:
    """Message tone transformation service"""

    # Ton seçenekleri
    TONE_OPTIONS = {
        "yaratici": {
            "name": "Yapıcı",
            "description": "Çözüm odaklı, yapıcı bir ton",
            "prompt_suffix": "Mesajı çözüm odaklı ve yapıcı bir tona dönüştür. Suçlama yerine 'ben dili' kullan.",
        },
        "empatik": {
            "name": "Empatik",
            "description": "Duygusal ve anlayışlı bir ton",
            "prompt_suffix": "Mesajı empatik ve anlayışlı bir tona dönüştür. Karşı tarafın duygularını da düşün.",
        },
        "sakin": {
            "name": "Sakin",
            "description": "Gerginliği azaltan, sakin bir ton",
            "prompt_suffix": "Mesajı sakin ve gerginliği azaltıcı bir tona dönüştür. Öfkeli ifadeleri yumuşat.",
        },
        "net": {
            "name": "Net ve Sınır Koyucu",
            "description": "Açık ve sınır koyan bir ton",
            "prompt_suffix": "Mesajı net ve sınır koyucu ama saygılı bir tona dönüştür. Pasif agresiflikten kaçın.",
        },
    }

    def __init__(self):
        self.ai_service = get_ai_service()

    def shift_tone(
        self,
        original_message: str,
        target_tone: str = "yaratici",
        context: str = "",
    ) -> dict[str, Any]:
        """
        Mesajın tonunu değiştir

        Args:
            original_message: Orijinal mesaj
            target_tone: Hedef ton (yaratici, empatik, sakin, net)
            context: Konuşma bağlamı (opsiyonel)

        Returns:
            Transformed message with analysis
        """
        if not self.ai_service._is_available():
            return self._fallback_tone_shift(original_message, target_tone)

        try:
            # Mesajı analiz et
            analysis = self._analyze_message_tone(original_message)

            # Ton değiştirme prompt'u oluştur
            prompt = self._build_tone_shift_prompt(
                original_message, target_tone, context, analysis
            )

            # AI'dan yanıt al
            response = self.ai_service._call_llm(prompt, max_tokens=500)

            # Parse et
            rewritten_message = self._parse_rewritten_message(response)

            logger.info(
                "Tone shift completed",
                extra={
                    "target_tone": target_tone,
                    "original_length": len(original_message),
                    "rewritten_length": len(rewritten_message),
                },
            )

            return {
                "original_message": original_message,
                "rewritten_message": rewritten_message,
                "target_tone": target_tone,
                "tone_name": self.TONE_OPTIONS[target_tone]["name"],
                "analysis": analysis,
                "improvements": self._highlight_improvements(original_message, rewritten_message),
            }

        except Exception as e:
            logger.error(f"Tone shift failed: {e}", exc_info=True)
            return self._fallback_tone_shift(original_message, target_tone)

    def _analyze_message_tone(self, message: str) -> dict[str, Any]:
        """Mesajın mevcut tonunu analiz et"""
        message_lower = message.lower()

        # Agresif göstergeler
        aggressive_keywords = ["asla", "hep", "hiç", "her zaman", "bıktım", "yeter"]
        aggressive_count = sum(1 for kw in aggressive_keywords if kw in message_lower)

        # Suçlayıcı dil (Sen dili)
        accusatory_count = message_lower.count("sen ") + message_lower.count("senin ")

        # Büyük harf kullanımı
        is_shouting = message.isupper() and len(message) > 5

        # Ünlem işareti
        exclamation_count = message.count("!")

        # Genel ton skoru
        tone_score = 0
        if aggressive_count > 0:
            tone_score += aggressive_count * 20
        if accusatory_count > 2:
            tone_score += 30
        if is_shouting:
            tone_score += 40
        if exclamation_count > 2:
            tone_score += 20

        tone_score = min(tone_score, 100)

        return {
            "current_tone": "Agresif" if tone_score > 60 else "Nötr" if tone_score > 30 else "Sakin",
            "tone_score": tone_score,
            "issues": {
                "aggressive_language": aggressive_count > 0,
                "accusatory_language": accusatory_count > 2,
                "shouting": is_shouting,
                "excessive_exclamation": exclamation_count > 2,
            },
        }

    def _build_tone_shift_prompt(
        self,
        message: str,
        target_tone: str,
        context: str,
        analysis: dict,
    ) -> str:
        """Ton değiştirme prompt'u oluştur"""
        tone_config = self.TONE_OPTIONS.get(target_tone, self.TONE_OPTIONS["yaratici"])

        return f"""Sen bir İletişim Koçusun. Kullanıcının mesajını daha etkili bir tona dönüştürüyorsun.

ORİJİNAL MESAJ:
"{message}"

MEVCUT TON ANALİZİ:
- Ton: {analysis["current_tone"]}
- Skor: {analysis["tone_score"]}/100
- Sorunlar: {", ".join([k for k, v in analysis["issues"].items() if v])}

{f"BAĞLAM: {context}" if context else ""}

HEDEF TON: {tone_config["name"]}
GÖREV: {tone_config["prompt_suffix"]}

KURALLAR:
1. Mesajın anlamını değiştirme, sadece tonunu iyileştir
2. "Sen" yerine "Ben" dili kullan (örn: "Sen hep böylesin" → "Ben bu durumda kendimi böyle hissediyorum")
3. Genellemelerden kaçın ("hep", "asla", "hiç")
4. Somut örnekler ver
5. Duygularını ifade et ama suçlama
6. Kısa ve net ol (maksimum 2-3 cümle)

Sadece yeniden yazılmış mesajı döndür, başka açıklama ekleme."""

    def _parse_rewritten_message(self, response: str) -> str:
        """AI yanıtından mesajı parse et"""
        # Tırnak işaretleri içindeki metni bul
        import re

        quoted = re.findall(r'"([^"]*)"', response)
        if quoted:
            return quoted[0]

        # Yoksa tüm yanıtı döndür (temizlenmiş)
        return response.strip().strip('"').strip("'")

    def _highlight_improvements(self, original: str, rewritten: str) -> list[str]:
        """İyileştirmeleri vurgula"""
        improvements = []

        # "Sen" → "Ben" dönüşümü
        if "sen " in original.lower() and "ben " in rewritten.lower():
            improvements.append("'Sen dili' yerine 'Ben dili' kullanıldı")

        # Genelleme azaltma
        generalizations = ["hep", "asla", "hiç", "her zaman"]
        if any(g in original.lower() for g in generalizations):
            if not any(g in rewritten.lower() for g in generalizations):
                improvements.append("Genellemeler kaldırıldı")

        # Büyük harf azaltma
        if original.isupper() and not rewritten.isupper():
            improvements.append("Bağırma tonu yumuşatıldı")

        # Ünlem azaltma
        if original.count("!") > rewritten.count("!"):
            improvements.append("Aşırı ünlem kullanımı azaltıldı")

        return improvements if improvements else ["Ton daha yapıcı hale getirildi"]

    def _fallback_tone_shift(self, message: str, target_tone: str) -> dict[str, Any]:
        """AI yoksa basit kural tabanlı dönüşüm"""
        rewritten = message

        # Basit dönüşümler
        rewritten = rewritten.replace("Sen hep", "Ben genellikle")
        rewritten = rewritten.replace("Sen asla", "Ben bazen")
        rewritten = rewritten.replace("Sen hiç", "Ben nadiren")

        # Büyük harfi düzelt
        if rewritten.isupper():
            rewritten = rewritten.capitalize()

        # Fazla ünlemi azalt
        while "!!" in rewritten:
            rewritten = rewritten.replace("!!", "!")

        return {
            "original_message": message,
            "rewritten_message": rewritten,
            "target_tone": target_tone,
            "tone_name": self.TONE_OPTIONS.get(target_tone, {}).get("name", "Yapıcı"),
            "analysis": {"current_tone": "Bilinmiyor", "tone_score": 50, "issues": {}},
            "improvements": ["Basit ton iyileştirmesi yapıldı (AI kullanılamıyor)"],
        }


# Singleton
_tone_shifter_instance = None


def get_tone_shifter() -> ToneShifter:
    """Tone shifter singleton"""
    global _tone_shifter_instance
    if _tone_shifter_instance is None:
        _tone_shifter_instance = ToneShifter()
    return _tone_shifter_instance
