"""Vision Analysis Service - Screenshot and Image Analysis

Bu modül, ekran görüntülerinden metin çıkarma (OCR) ve duygusal analiz yapar.
GPT-4o Vision ve Claude 3.5 Sonnet Vision API'lerini destekler.
"""

import base64
import logging
from typing import Any, Optional

import google.generativeai as genai
from anthropic import Anthropic
from openai import OpenAI

from app.core.config import settings
from app.services.prompts import VISION_ANALYSIS_PROMPT

logger = logging.getLogger(__name__)


class VisionAnalysisService:
    """Görsel içerik analizi servisi"""

    def __init__(self):
        self.openai_client = None
        self.anthropic_client = None
        self.gemini_client = None
        self.provider = settings.AI_PROVIDER

        # API clients
        if self.provider == "openai" and settings.OPENAI_API_KEY:
            self.openai_client = OpenAI(api_key=settings.OPENAI_API_KEY)
        elif self.provider == "anthropic" and settings.ANTHROPIC_API_KEY:
            self.anthropic_client = Anthropic(api_key=settings.ANTHROPIC_API_KEY)
        elif self.provider == "gemini" and settings.GEMINI_API_KEY:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            self.gemini_client = genai

    def analyze_screenshot(
        self, image_data: bytes, image_format: str = "png"
    ) -> dict[str, Any]:
        """
        Ekran görüntüsünü analiz et

        Args:
            image_data: Görüntü verisi (bytes)
            image_format: Görüntü formatı (png, jpg, jpeg)

        Returns:
            Analiz sonucu (OCR + duygusal analiz)
        """
        if not self._is_vision_available():
            return self._fallback_analysis()

        try:
            # Base64 encode
            image_base64 = base64.b64encode(image_data).decode("utf-8")

            if self.provider == "openai" and self.openai_client:
                return self._analyze_with_openai(image_base64, image_format)
            elif self.provider == "anthropic" and self.anthropic_client:
                return self._analyze_with_anthropic(image_base64, image_format)
            elif self.provider == "gemini" and self.gemini_client:
                return self._analyze_with_gemini(image_data, image_format)

            return self._fallback_analysis()

        except Exception as e:
            logger.error(
                "Vision analysis failed",
                extra={"error": str(e), "provider": self.provider},
                exc_info=True,
            )
            return self._fallback_analysis()

    def _analyze_with_openai(
        self, image_base64: str, image_format: str
    ) -> dict[str, Any]:
        """GPT-4o Vision ile analiz"""
        response = self.openai_client.chat.completions.create(
            model="gpt-4o",  # Vision model
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": VISION_ANALYSIS_PROMPT},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/{image_format};base64,{image_base64}"
                            },
                        },
                    ],
                }
            ],
            max_tokens=1500,
            temperature=0.3,  # Lower temperature for more accurate OCR
        )

        content = response.choices[0].message.content
        return self._parse_vision_response(content)

    def _analyze_with_anthropic(
        self, image_base64: str, image_format: str
    ) -> dict[str, Any]:
        """Claude 3.5 Sonnet Vision ile analiz"""
        response = self.anthropic_client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=1500,
            temperature=0.3,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": f"image/{image_format}",
                                "data": image_base64,
                            },
                        },
                        {"type": "text", "text": VISION_ANALYSIS_PROMPT},
                    ],
                }
            ],
        )

        content = response.content[0].text
        return self._parse_vision_response(content)

    def _analyze_with_gemini(self, image_data: bytes, image_format: str) -> dict[str, Any]:
        """Gemini Vision ile analiz"""
        model = genai.GenerativeModel("gemini-1.5-flash")

        # Gemini için image part oluştur
        image_part = {"mime_type": f"image/{image_format}", "data": image_data}

        response = model.generate_content(
            [VISION_ANALYSIS_PROMPT, image_part],
            generation_config=genai.GenerationConfig(
                max_output_tokens=1500, temperature=0.3
            ),
        )

        return self._parse_vision_response(response.text)

    def _parse_vision_response(self, response: str) -> dict[str, Any]:
        """Vision API yanıtını parse et"""
        import json

        try:
            # JSON'ı bul ve parse et
            start = response.find("{")
            end = response.rfind("}") + 1
            if start != -1 and end > start:
                json_str = response[start:end]
                result = json.loads(json_str)
                return result
        except Exception as e:
            logger.error(f"Vision response parsing failed: {e}")

        return self._fallback_analysis()

    def _is_vision_available(self) -> bool:
        """Vision API kullanılabilir mi?"""
        if self.provider == "openai":
            return self.openai_client is not None
        elif self.provider == "anthropic":
            return self.anthropic_client is not None
        elif self.provider == "gemini":
            return self.gemini_client is not None
        return False

    def _fallback_analysis(self) -> dict[str, Any]:
        """Vision API yoksa fallback"""
        return {
            "cikarilan_metin": "",
            "mesaj_sayisi": 0,
            "katilimcilar": [],
            "duygusal_analiz": {
                "emoji_kullanimi": "Tespit edilemedi",
                "ton": "Analiz edilemedi",
                "dikkat_ceken_noktalar": ["Vision API kullanılamıyor"],
            },
            "iletisim_kaliplari": {
                "mesaj_dengesi": "Tespit edilemedi",
                "yanit_hizi": "Tespit edilemedi",
                "mesaj_uzunlugu": "Tespit edilemedi",
            },
            "oneriler": [
                "Görsel analiz için AI API key'i gereklidir",
                "Metin formatında konuşma yükleyerek analiz yapabilirsiniz",
            ],
        }

    def extract_text_only(self, image_data: bytes, image_format: str = "png") -> str:
        """Sadece OCR (metin çıkarma)"""
        result = self.analyze_screenshot(image_data, image_format)
        return result.get("cikarilan_metin", "")


# Singleton instance
_vision_service_instance: Optional[VisionAnalysisService] = None


def get_vision_service() -> VisionAnalysisService:
    """Vision service singleton"""
    global _vision_service_instance
    if _vision_service_instance is None:
        _vision_service_instance = VisionAnalysisService()
    return _vision_service_instance
