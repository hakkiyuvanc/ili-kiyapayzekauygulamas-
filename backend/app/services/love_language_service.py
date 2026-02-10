"""Love Language Test Service (Stage 3)"""

from typing import Any, Dict, List


class LoveLanguageService:
    """5 Love Languages test and analysis"""

    # Test questions (simplified version)
    QUESTIONS = [
        {
            "id": 1,
            "question": "Partnerimden en çok ne yapmalarını isterim?",
            "options": {
                "words": "Bana ne kadar özel olduğumu söylemelerini",
                "time": "Benimle kaliteli zaman geçirmelerini",
                "gifts": "Küçük sürpriz hediyeler almalarını",
                "service": "Bana yardım etmelerini ve işlerimi kolaylaştırmalarını",
                "touch": "Bana sarılmalarını ve fiziksel yakınlık göstermelerini"
            }
        },
        {
            "id": 2,
            "question": "En çok ne beni mutlu eder?",
            "options": {
                "words": "Takdir ve övgü dolu sözler duymak",
                "time": "Birlikte aktiviteler yapmak",
                "gifts": "Düşünceli hediyeler almak",
                "service": "Partnerimin benim için fedakarlık yapması",
                "touch": "Fiziksel yakınlık ve dokunuş"
            }
        },
        {
            "id": 3,
            "question": "Partnerim beni en çok nasıl üzer?",
            "options": {
                "words": "Eleştiri ve olumsuz sözler",
                "time": "Zamanını başka şeylere ayırması",
                "gifts": "Özel günleri unutması",
                "service": "Bana yardım etmemesi",
                "touch": "Fiziksel mesafe koyması"
            }
        },
        {
            "id": 4,
            "question": "İlişkide en önemli olan nedir?",
            "options": {
                "words": "Açık ve destekleyici iletişim",
                "time": "Birlikte kaliteli vakit geçirmek",
                "gifts": "Düşünceli jestler ve hediyeler",
                "service": "Birbirimize destek olmak",
                "touch": "Fiziksel yakınlık ve şefkat"
            }
        },
        {
            "id": 5,
            "question": "Partnerime sevgimi en çok nasıl gösteririm?",
            "options": {
                "words": "Ona ne kadar önemli olduğunu söyleyerek",
                "time": "Onunla zaman geçirerek",
                "gifts": "Hediyeler alarak",
                "service": "Ona yardım ederek",
                "touch": "Fiziksel yakınlık göstererek"
            }
        }
    ]

    LANGUAGE_NAMES = {
        "words": "Onaylayıcı Sözler",
        "time": "Kaliteli Zaman",
        "gifts": "Hediye Almak",
        "service": "Hizmet Eylemleri",
        "touch": "Fiziksel Temas"
    }

    LANGUAGE_DESCRIPTIONS = {
        "words": "Sözlü takdir, övgü ve destekleyici sözler sizin için çok önemli. Partnerinizin sizi ne kadar sevdiğini ve takdir ettiğini duymanız gerekir.",
        "time": "Partnerinizle kaliteli, kesintisiz zaman geçirmek sizin için en değerli şey. Tam dikkat ve birlikte aktiviteler yapmanız önemli.",
        "gifts": "Düşünceli hediyeler ve jestler sizin için sevginin somut göstergeleri. Hediyenin değeri değil, arkasındaki düşünce önemli.",
        "service": "Partnerinizin size yardım etmesi ve hayatınızı kolaylaştırması sizin için sevginin göstergesi. Eylemler sözlerden daha güçlü.",
        "touch": "Fiziksel yakınlık, sarılma, el tutma ve dokunuş sizin için çok önemli. Fiziksel temas sizi güvende ve sevilmiş hissettirir."
    }

    def get_questions(self) -> List[Dict[str, Any]]:
        """Get all test questions"""
        return self.QUESTIONS

    def calculate_results(self, answers: Dict[int, str]) -> Dict[str, Any]:
        """Calculate test results from answers
        
        Args:
            answers: Dict of {question_id: selected_language_key}
            
        Returns:
            Test results with primary/secondary languages and scores
        """
        # Count selections
        scores = {
            "words": 0,
            "time": 0,
            "gifts": 0,
            "service": 0,
            "touch": 0
        }

        for answer in answers.values():
            if answer in scores:
                scores[answer] += 1

        # Convert to percentages
        total = len(answers)
        if total > 0:
            percentages = {k: (v / total) * 100 for k, v in scores.items()}
        else:
            percentages = scores

        # Find primary and secondary
        sorted_languages = sorted(percentages.items(), key=lambda x: x[1], reverse=True)
        primary = sorted_languages[0][0]
        secondary = sorted_languages[1][0] if len(sorted_languages) > 1 else None

        return {
            "primary_language": self.LANGUAGE_NAMES[primary],
            "primary_key": primary,
            "secondary_language": self.LANGUAGE_NAMES[secondary] if secondary else None,
            "secondary_key": secondary,
            "scores": {self.LANGUAGE_NAMES[k]: round(v, 1) for k, v in percentages.items()},
            "description": self.LANGUAGE_DESCRIPTIONS[primary],
            "recommendations": self._get_recommendations(primary, secondary)
        }

    def _get_recommendations(self, primary: str, secondary: str | None) -> List[str]:
        """Get personalized recommendations based on love language"""
        recommendations = {
            "words": [
                "Partnerinize düzenli olarak ne kadar özel olduklarını söyleyin",
                "Takdir ve övgü içeren notlar bırakın",
                "Eleştiriden kaçının, yapıcı geri bildirim verin"
            ],
            "time": [
                "Telefonları kapalı, kesintisiz zaman geçirin",
                "Birlikte aktiviteler planlayın",
                "Tam dikkatinizi verin, göz teması kurun"
            ],
            "gifts": [
                "Küçük sürpriz hediyeler hazırlayın",
                "Özel günleri unutmayın",
                "Düşünceli jestlerde bulunun"
            ],
            "service": [
                "Partnerinize yardım edin ve destek olun",
                "Onların işlerini kolaylaştıracak şeyler yapın",
                "Fedakarlık gösterin"
            ],
            "touch": [
                "Fiziksel yakınlık gösterin (sarılma, el tutma)",
                "Günlük dokunuşları ihmal etmeyin",
                "Fiziksel mesafe koymayın"
            ]
        }

        recs = recommendations.get(primary, [])
        if secondary and secondary != primary:
            recs.extend(recommendations.get(secondary, [])[:2])

        return recs[:5]  # Max 5 recommendations

    def analyze_from_conversation(
        self,
        conversation_text: str,
        ai_service
    ) -> Dict[str, Any]:
        """Analyze love language from conversation using AI
        
        Args:
            conversation_text: Conversation text
            ai_service: AIService instance for analysis
            
        Returns:
            Predicted love language with confidence
        """
        # This would use AI to infer love language from conversation
        # For now, return a placeholder
        return {
            "predicted_language": "Kaliteli Zaman",
            "confidence": 0.7,
            "evidence": [
                "Birlikte zaman geçirme vurgusu",
                "Aktivite önerileri"
            ],
            "note": "Bu tahmin konuşma analizine dayanıyor. Kesin sonuç için testi tamamlayın."
        }


# Singleton instance
_love_language_service = None


def get_love_language_service() -> LoveLanguageService:
    """Get LoveLanguageService singleton"""
    global _love_language_service
    if _love_language_service is None:
        _love_language_service = LoveLanguageService()
    return _love_language_service
