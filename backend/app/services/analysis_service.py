"""Analiz Servisi - Business Logic"""

from typing import Any

from backend.ml.analyzer import get_analyzer


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

    # ==================== Stage 2: Local Persistence ====================

    def save_analysis(
        self,
        db,
        user_id: int,
        conversation_text: str,
        analysis_result: dict[str, Any],
        privacy_mode: bool = True
    ) -> int:
        """Save analysis to local database
        
        Args:
            db: Database session
            user_id: User ID
            conversation_text: Original conversation
            analysis_result: Analysis results
            privacy_mode: Whether to mask data
            
        Returns:
            Analysis ID
        """
        from app.models.database import Analysis
        from app.utils.data_masking import mask_conversation

        # Mask conversation if privacy mode enabled
        masked_text = conversation_text
        name_mapping = {}
        if privacy_mode:
            masked_text, name_mapping = mask_conversation(conversation_text)

        # Extract scores from result
        gottman_report = analysis_result.get("gottman_report", {})
        genel_karne = gottman_report.get("genel_karne", {})

        # Create analysis record
        analysis = Analysis(
            user_id=user_id,
            privacy_mode=privacy_mode,
            text_length=len(conversation_text),
            overall_score=genel_karne.get("overall_score", 0.0),
            sentiment_score=analysis_result.get("metrics", {}).get("sentiment", {}).get("score", 0.0),
            empathy_score=analysis_result.get("metrics", {}).get("empathy", {}).get("score", 0.0),
            conflict_score=analysis_result.get("metrics", {}).get("conflict", {}).get("score", 0.0),
            we_language_score=analysis_result.get("metrics", {}).get("we_language", {}).get("score", 0.0),
            full_report=analysis_result,
            summary=analysis_result.get("summary", ""),
            message_count=analysis_result.get("metrics", {}).get("total_messages", 0),
            participant_count=2  # Default for now
        )

        db.add(analysis)
        db.commit()
        db.refresh(analysis)

        return analysis.id

    def load_analysis(self, db, analysis_id: int) -> dict[str, Any] | None:
        """Load analysis from database
        
        Args:
            db: Database session
            analysis_id: Analysis ID
            
        Returns:
            Analysis result or None
        """
        from app.models.database import Analysis

        analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
        if not analysis:
            return None

        return {
            "id": analysis.id,
            "created_at": analysis.created_at.isoformat() if analysis.created_at else None,
            "overall_score": analysis.overall_score,
            "sentiment_score": analysis.sentiment_score,
            "empathy_score": analysis.empathy_score,
            "conflict_score": analysis.conflict_score,
            "we_language_score": analysis.we_language_score,
            "full_report": analysis.full_report,
            "summary": analysis.summary,
            "privacy_mode": analysis.privacy_mode
        }

    def list_user_analyses(
        self,
        db,
        user_id: int,
        limit: int = 10,
        offset: int = 0
    ) -> list[dict[str, Any]]:
        """List user's analysis history
        
        Args:
            db: Database session
            user_id: User ID
            limit: Max results
            offset: Pagination offset
            
        Returns:
            List of analysis summaries
        """
        from app.models.database import Analysis

        analyses = (
            db.query(Analysis)
            .filter(Analysis.user_id == user_id)
            .order_by(Analysis.created_at.desc())
            .limit(limit)
            .offset(offset)
            .all()
        )

        return [
            {
                "id": a.id,
                "created_at": a.created_at.isoformat() if a.created_at else None,
                "overall_score": a.overall_score,
                "summary": a.summary[:200] if a.summary else "",
                "privacy_mode": a.privacy_mode
            }
            for a in analyses
        ]


# Singleton instance
_service_instance = None


def get_analysis_service() -> AnalysisService:
    """Analysis service singleton"""
    global _service_instance
    if _service_instance is None:
        _service_instance = AnalysisService()
    return _service_instance
