"""Analiz Servisi - Business Logic"""

import os
import sys
from typing import Any

# ml modülü backend dizininin bir üstündeki ml/ klasöründe
project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

import sys
from pathlib import Path

# Add parent directory to path for ml module
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))

from ml.analyzer import get_analyzer


class AnalysisService:
    """İlişki analizi servisi"""

    def __init__(self):
        self.analyzer = get_analyzer()

    def analyze_text(
        self,
        text: str,
        format_type: str = "auto",
        privacy_mode: bool = True,
    ) -> dict[str, Any]:
        """
        Metin analizi yap

        Args:
            text: Analiz edilecek metin
            format_type: Metin formatı
            privacy_mode: PII maskeleme

        Returns:
            Analiz raporu
        """
        try:
            report = self.analyzer.analyze_text(
                text=text,
                format_type=format_type,
                privacy_mode=privacy_mode,
            )
            return report
        except Exception as e:
            return {
                "status": "error",
                "error": str(e),
                "message": "Analiz sırasında bir hata oluştu",
            }

    def quick_score(self, text: str) -> float:
        """Hızlı skor hesapla"""
        try:
            return self.analyzer.quick_score(text)
        except Exception:
            return 0.0

    def validate_text(self, text: str, min_length: int = 10, max_length: int = 50000) -> tuple:
        """
        Metin validasyonu

        Returns:
            (is_valid: bool, error_message: str)
        """
        if not text or not text.strip():
            return False, "Metin boş olamaz"

        text_length = len(text)

        if text_length < min_length:
            return False, f"Metin çok kısa (minimum {min_length} karakter)"

        if text_length > max_length:
            return False, f"Metin çok uzun (maksimum {max_length} karakter)"

        # En az birkaç kelime olmalı
        word_count = len(text.split())
        if word_count < 3:
            return False, "En az 3 kelime gerekli"

        return True, ""


# Singleton instance
_service_instance = None


def get_analysis_service() -> AnalysisService:
    """Analysis service singleton"""
    global _service_instance
    if _service_instance is None:
        _service_instance = AnalysisService()
    return _service_instance
