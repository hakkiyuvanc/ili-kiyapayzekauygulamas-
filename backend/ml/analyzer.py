"""Ana İlişki Analiz Pipeline'ı"""

# spaCy optional - fallback to simple preprocessor
try:
    from ml.preprocessing.turkish_nlp import get_preprocessor

    USE_SPACY = True
except (ImportError, OSError):
    from ml.preprocessing.simple_preprocessor import get_simple_preprocessor as get_preprocessor

    USE_SPACY = False

from ml.features.relationship_metrics import RelationshipMetrics
from ml.features.report_generator import ReportGenerator
from ml.preprocessing.conversation_parser import ConversationParser


class RelationshipAnalyzer:
    """İlişki analizi ana sınıfı"""

    def __init__(self):
        self.preprocessor = get_preprocessor()
        self.parser = ConversationParser()
        self.metrics_calculator = RelationshipMetrics()
        self.report_generator = ReportGenerator()
        self.use_spacy = USE_SPACY

    def analyze_text(
        self,
        text: str,
        format_type: str = "auto",
        privacy_mode: bool = True,
    ) -> dict[str, any]:
        """
        Metin analizi yap

        Args:
            text: Analiz edilecek metin (konuşma veya tek metin)
            format_type: 'auto', 'whatsapp', 'simple', 'plain'
            privacy_mode: PII maskeleme yapılsın mı

        Returns:
            Analiz raporu
        """
        # 1. Konuşma parse et
        if format_type == "plain":
            # Tek metin, konuşma değil
            parsed_data = {
                "messages": [{"sender": "User", "content": text}],
                "stats": {"total_messages": 1, "participant_count": 1},
                "format_detected": "plain",
            }
        else:
            parsed_data = self.parser.parse(text, format_type)

        messages = parsed_data["messages"]
        conversation_stats = parsed_data["stats"]

        if not messages:
            return {
                "error": "Mesaj bulunamadı",
                "status": "failed",
            }

        # 2. Metni birleştir ve preprocess et
        full_text = " ".join([msg["content"] for msg in messages])

        preprocessed = self.preprocessor.preprocess(
            full_text,
            clean=True,
            remove_pii=privacy_mode,
            remove_stop=False,
        )

        processed_text = preprocessed.get("pii_masked", preprocessed.get("cleaned", full_text))

        # 3. Metrikleri hesapla
        metrics = {}

        # Sentiment
        metrics["sentiment"] = self.metrics_calculator.calculate_sentiment_score(processed_text)

        # Empati
        metrics["empathy"] = self.metrics_calculator.calculate_empathy_score(processed_text)

        # Çatışma
        metrics["conflict"] = self.metrics_calculator.calculate_conflict_score(processed_text)

        # Biz-dili
        metrics["we_language"] = self.metrics_calculator.calculate_we_language_score(processed_text)

        # İletişim dengesi (eğer birden fazla katılımcı varsa)
        if conversation_stats.get("participant_count", 0) >= 2:
            messages_by_participant = self.parser.split_by_participant(messages)
            metrics["communication_balance"] = (
                self.metrics_calculator.calculate_communication_balance(messages_by_participant)
            )
        else:
            metrics["communication_balance"] = {
                "score": 0.0,
                "label": "Tek Taraflı",
                "distribution": {},
            }

        # 4. Rapor oluştur
        report = self.report_generator.generate_report(
            metrics=metrics,
            conversation_stats=conversation_stats,
            metadata={
                "text_length": len(text),
                "processed_length": len(processed_text),
                "format": parsed_data.get("format_detected"),
                "privacy_mode": privacy_mode,
            },
        )

        report["status"] = "success"
        report["preprocessing_stats"] = preprocessed.get("stats", {})

        return report

    def analyze_conversation(
        self,
        messages: list[dict[str, str]],
        privacy_mode: bool = True,
    ) -> dict[str, any]:
        """
        Yapılandırılmış mesaj listesini analiz et

        Args:
            messages: [{"sender": "...", "content": "...", "timestamp": "..."}]
            privacy_mode: PII maskeleme

        Returns:
            Analiz raporu
        """
        if not messages:
            return {"error": "Mesaj listesi boş", "status": "failed"}

        # Konuşma istatistikleri
        conversation_stats = self.parser.calculate_conversation_stats(messages)

        # Metni birleştir
        full_text = " ".join([msg["content"] for msg in messages])

        # Preprocess
        preprocessed = self.preprocessor.preprocess(
            full_text,
            clean=True,
            remove_pii=privacy_mode,
            remove_stop=False,
        )

        processed_text = preprocessed.get("pii_masked", preprocessed.get("cleaned", full_text))

        # Metrikleri hesapla
        metrics = {
            "sentiment": self.metrics_calculator.calculate_sentiment_score(processed_text),
            "empathy": self.metrics_calculator.calculate_empathy_score(processed_text),
            "conflict": self.metrics_calculator.calculate_conflict_score(processed_text),
            "we_language": self.metrics_calculator.calculate_we_language_score(processed_text),
        }

        # İletişim dengesi
        if conversation_stats.get("participant_count", 0) >= 2:
            messages_by_participant = self.parser.split_by_participant(messages)
            metrics["communication_balance"] = (
                self.metrics_calculator.calculate_communication_balance(messages_by_participant)
            )
        else:
            metrics["communication_balance"] = {
                "score": 0.0,
                "label": "Tek Taraflı",
            }

        # Rapor oluştur
        report = self.report_generator.generate_report(
            metrics=metrics,
            conversation_stats=conversation_stats,
            metadata={
                "message_count": len(messages),
                "privacy_mode": privacy_mode,
            },
        )

        report["status"] = "success"
        return report

    def quick_score(self, text: str) -> float:
        """Hızlı genel skor hesapla (0-100)"""
        report = self.analyze_text(text, format_type="plain", privacy_mode=False)
        if report.get("status") == "success":
            return report.get("overall_score", 0.0)
        return 0.0


# Singleton instance
_analyzer_instance = None


def get_analyzer() -> RelationshipAnalyzer:
    """Analyzer singleton instance"""
    global _analyzer_instance
    if _analyzer_instance is None:
        _analyzer_instance = RelationshipAnalyzer()
    return _analyzer_instance
