"""İlişki Analiz Metrikleri - 5 Temel Metrik"""

import re


class RelationshipMetrics:
    """İlişki sağlığı metrikleri hesaplama"""

    def __init__(self):
        # Türkçe sentiment sözlükleri
        self.positive_words = {
            "sevgi",
            "aşk",
            "mutlu",
            "güzel",
            "harika",
            "mükemmel",
            "iyi",
            "süper",
            "seviyorum",
            "özledim",
            "teşekkür",
            "sağol",
            "canım",
            "tatlım",
            "aşkım",
            "bebeğim",
            "güzelim",
            "harikasın",
            "anlıyorum",
            "destekliyorum",
            "gururluyum",
            "başarılı",
            "zeki",
            "komik",
            "eğlenceli",
            "heyecanlı",
            "mutluyum",
            "sevinçli",
            "minnettar",
            "şanslı",
            "beraber",
            "birlikte",
            "yanımda",
            "seni",
            "bizi",
        }

        self.negative_words = {
            "kötü",
            "berbat",
            "iğrenç",
            "sinir",
            "öfke",
            "nefret",
            "yalan",
            "aldatma",
            "hep",
            "hiç",
            "asla",
            "her zaman",
            "bıktım",
            "yoruldum",
            "sıkıldım",
            "usandım",
            "aptal",
            "salak",
            "ahmak",
            "gerizekalı",
            "umurumda",
            "değil",
            "boşver",
            "yanlış",
            "hata",
            "suç",
            "kabahat",
            "sen",
            "senin",
            "senden",
            "sana",
            "ben",
            "benim",
            "bana",
            "üzgün",
            "mutsuz",
            "kızgın",
            "sinirli",
            "stresli",
        }

        # Empati göstergeleri
        self.empathy_indicators = {
            "anlıyorum",
            "anlayabiliyorum",
            "hissediyorum",
            "görüyorum",
            "biliyorum",
            "haklısın",
            "doğru",
            "katılıyorum",
            "seninle",
            "senin için",
            "üzülüyorum",
            "destekliyorum",
            "yanındayım",
            "yardımcı",
            "dinliyorum",
            "anlamak",
            "ne hissettiğini",
            "nasıl hissettiğini",
            "neler yaşadığını",
            "canım",
            "aşkım",
            "bebeğim",
            "tatlım",
            "güzelim",
            "hayatım",
            "sevgilim",
            "kalbim",
            "özledim",
            "seni düşünüyorum",
            "merak ediyorum",
            "nasılsın",
            "iyi misin",
            "yanındayım",
            "seninleyim",
            "sana güveniyorum",
        }

        # Empati emojileri (text ve variation selector ile)
        self.empathy_emojis = {
            "❤️",
            "❤",
            "💕",
            "💖",
            "💗",
            "💝",
            "💞",
            "💓",
            "💙",
            "💚",
            "💛",
            "💜",
            "🧡",
            "🖤",
            "🤍",
            "🤎",
            "🥰",
            "😍",
            "😘",
            "😗",
            "😙",
            "😚",
            "🤗",
            "😊",
            "☺️",
            "☺",
            "😌",
            "💑",
            "👫",
            "🫶",
        }

        # Çatışma göstergeleri
        self.conflict_indicators = {
            "ama",
            "fakat",
            "ancak",
            "lakin",
            "oysa",
            "halbuki",
            "ne var ki",
            "hep",
            "hiç",
            "asla",
            "her zaman",
            "hiçbir zaman",
            "sürekli",
            "daima",
            "yine",
            "gene",
            "tekrar",
            "yeter",
            "bıktım",
            "usandım",
            "yoruldum",
            "sen hep",
            "sen hiç",
            "sen her zaman",
            "sen asla",
            "neden hep",
        }

        # "Biz" dili göstergeleri
        self.we_language = {
            "biz",
            "bizim",
            "bize",
            "bizden",
            "birlikte",
            "beraber",
            "ikimiz",
            "bizimle",
            "beraberce",
            "ortak",
            "paylaş",
            "paylaşalım",
            "yapalım",
            "gidelim",
            "edelim",
            "olalım",
            "düşünelim",
            "konuşalım",
        }

        # "Ben/Sen" dili göstergeleri
        self.i_you_language = {
            "ben",
            "benim",
            "bana",
            "benden",
            "benimle",
            "sen",
            "senin",
            "sana",
            "senden",
            "seninle",
            "seni",
            "beni",
        }

    def calculate_sentiment_score(self, text: str) -> dict[str, float]:
        """
        Sentiment skoru hesapla (0-100)
        100: Çok pozitif, 50: Nötr, 0: Çok negatif
        """
        text_lower = text.lower()
        words = text_lower.split()

        positive_count = sum(1 for word in words if word in self.positive_words)
        negative_count = sum(1 for word in words if word in self.negative_words)

        total = positive_count + negative_count
        if total == 0:
            score = 50.0  # Nötr
        else:
            score = (positive_count / total) * 100

        return {
            "score": round(score, 2),
            "positive_words": positive_count,
            "negative_words": negative_count,
            "label": self._sentiment_label(score),
        }

    def calculate_empathy_score(self, text: str) -> dict[str, float]:
        """
        Empati skoru hesapla (0-100)
        Empati göstergelerinin yoğunluğuna göre
        """
        text_lower = text.lower()

        empathy_count = 0
        for indicator in self.empathy_indicators:
            empathy_count += text_lower.count(indicator)

        # Emoji desteği
        emoji_count = sum(1 for char in text if char in self.empathy_emojis)
        empathy_count += emoji_count

        # Normalize et (her 100 kelimede kaç empati göstergesi var)
        words = text_lower.split()
        word_count = len(words)

        if word_count == 0:
            return {"score": 0.0, "count": 0, "emoji_count": 0, "label": "Yok"}

        # Her 10 kelimede 1 empati göstergesi = 100 puan (daha hassas)
        empathy_ratio = (empathy_count / word_count) * 10
        score = min(empathy_ratio * 100, 100)

        return {
            "score": round(score, 2),
            "count": empathy_count - emoji_count,
            "emoji_count": emoji_count,
            "label": self._empathy_label(score),
        }

    def calculate_conflict_score(self, text: str) -> dict[str, float]:
        """
        Çatışma yoğunluğu skoru (0-100)
        0: Çok düşük, 100: Çok yüksek
        """
        # Emoji ve özel karakterleri temizle
        clean_text = re.sub(r"[^\w\s!?.,]", "", text)
        text_lower = clean_text.lower()

        conflict_count = 0
        for indicator in self.conflict_indicators:
            conflict_count += text_lower.count(indicator)

        # Büyük harf yoğunluğu (bağırma göstergesi) - sadece %40'ın üzeri anlamlı
        letters = [c for c in clean_text if c.isalpha()]
        capital_ratio = sum(1 for c in letters if c.isupper()) / max(len(letters), 1)

        # Ünlem işareti yoğunluğu - aşırı kullanım
        exclamation_count = clean_text.count("!")

        words = text_lower.split()
        word_count = len(words)

        if word_count == 0:
            return {"score": 0.0, "indicators": 0, "label": "Çok Düşük"}

        # İyileştirilmiş skorlama
        conflict_ratio = (conflict_count / word_count) * 100

        # Büyük harf bonusu - sadece %40'ın üzerinde anlamlı
        capital_bonus = max(0, (capital_ratio - 0.4)) * 50 if capital_ratio > 0.4 else 0

        # Ünlem bonusu - her 5 kelimede 1'den fazla ünlem
        exclamation_ratio = exclamation_count / word_count
        exclamation_bonus = (
            max(0, (exclamation_ratio - 0.2)) * 100 if exclamation_ratio > 0.2 else 0
        )

        score = min(conflict_ratio + capital_bonus + exclamation_bonus, 100)

        return {
            "score": round(score, 2),
            "indicators": conflict_count,
            "capital_ratio": round(capital_ratio * 100, 2),
            "exclamation_count": exclamation_count,
            "label": self._conflict_label(score),
        }

    def calculate_we_language_score(self, text: str) -> dict[str, float]:
        """
        "Biz-dili" vs "Ben/Sen-dili" oranı (0-100)
        100: Tamamen biz-dili, 0: Tamamen ben/sen-dili
        """
        text_lower = text.lower()
        words = text_lower.split()

        we_count = sum(1 for word in words if word in self.we_language)
        i_you_count = sum(1 for word in words if word in self.i_you_language)

        total = we_count + i_you_count
        if total == 0:
            score = 50.0  # Nötr
        else:
            score = (we_count / total) * 100

        return {
            "score": round(score, 2),
            "we_words": we_count,
            "i_you_words": i_you_count,
            "label": self._we_language_label(score),
        }

    def calculate_communication_balance(
        self, messages_by_participant: dict[str, list[dict]]
    ) -> dict[str, any]:
        """
        İletişim dengesi (0-100)
        100: Mükemmel denge, 0: Çok dengesiz
        """
        if len(messages_by_participant) < 2:
            return {"score": 0.0, "label": "Tek Taraflı", "distribution": {}}

        # Mesaj sayıları
        message_counts = {p: len(msgs) for p, msgs in messages_by_participant.items()}
        total_messages = sum(message_counts.values())

        # Kelime sayıları
        word_counts = {
            p: sum(len(m["content"].split()) for m in msgs)
            for p, msgs in messages_by_participant.items()
        }
        total_words = sum(word_counts.values())

        # Ideal dağılım: Her kişi %50
        participants = list(message_counts.keys())
        if len(participants) == 2:
            p1, p2 = participants

            # Mesaj dengesi
            msg_ratio = min(message_counts[p1], message_counts[p2]) / max(
                message_counts[p1], message_counts[p2]
            )

            # Kelime dengesi
            word_ratio = min(word_counts[p1], word_counts[p2]) / max(
                word_counts[p1], word_counts[p2]
            )

            # Genel denge skoru
            score = ((msg_ratio + word_ratio) / 2) * 100

            return {
                "score": round(score, 2),
                "label": self._balance_label(score),
                "distribution": {
                    p1: {
                        "message_percentage": round((message_counts[p1] / total_messages) * 100, 2),
                        "word_percentage": round((word_counts[p1] / total_words) * 100, 2),
                    },
                    p2: {
                        "message_percentage": round((message_counts[p2] / total_messages) * 100, 2),
                        "word_percentage": round((word_counts[p2] / total_words) * 100, 2),
                    },
                },
            }

        # 2'den fazla katılımcı için basit standart sapma
        import statistics

        percentages = [(count / total_messages) * 100 for count in message_counts.values()]
        std_dev = statistics.stdev(percentages) if len(percentages) > 1 else 0

        # Düşük standart sapma = iyi denge
        score = max(0, 100 - (std_dev * 5))

        return {
            "score": round(score, 2),
            "label": self._balance_label(score),
            "distribution": {
                p: {"message_percentage": round((c / total_messages) * 100, 2)}
                for p, c in message_counts.items()
            },
        }

    # Helper methods for labels
    def _sentiment_label(self, score: float) -> str:
        if score >= 70:
            return "Çok Olumlu"
        elif score >= 55:
            return "Olumlu"
        elif score >= 45:
            return "Nötr"
        elif score >= 30:
            return "Olumsuz"
        else:
            return "Çok Olumsuz"

    def _empathy_label(self, score: float) -> str:
        if score >= 70:
            return "Yüksek"
        elif score >= 40:
            return "Orta"
        elif score >= 10:
            return "Düşük"
        else:
            return "Çok Düşük"

    def _conflict_label(self, score: float) -> str:
        if score >= 70:
            return "Çok Yüksek"
        elif score >= 50:
            return "Yüksek"
        elif score >= 30:
            return "Orta"
        elif score >= 10:
            return "Düşük"
        else:
            return "Çok Düşük"

    def _we_language_label(self, score: float) -> str:
        if score >= 70:
            return "Güçlü Biz-dili"
        elif score >= 50:
            return "Dengeli"
        elif score >= 30:
            return "Ben/Sen Ağırlıklı"
        else:
            return "Zayıf Biz-dili"

    def _balance_label(self, score: float) -> str:
        if score >= 80:
            return "Mükemmel Denge"
        elif score >= 60:
            return "İyi Denge"
        elif score >= 40:
            return "Orta Denge"
        elif score >= 20:
            return "Zayıf Denge"
        else:
            return "Dengesiz"
