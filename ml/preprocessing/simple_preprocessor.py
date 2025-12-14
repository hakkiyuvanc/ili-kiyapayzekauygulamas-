"""Basit Mock Preprocessor - spaCy olmadan çalışır"""

import re
from typing import List, Dict, Set


class SimpleTurkishPreprocessor:
    """spaCy gerektirmeyen basit preprocessor"""

    def __init__(self):
        self.stopwords = self._load_turkish_stopwords()
        self.pii_patterns = self._compile_pii_patterns()

    def _load_turkish_stopwords(self) -> Set[str]:
        stopwords = {
            "acaba", "ama", "aslında", "az", "bazı", "belki", "biri", "birkaç",
            "birşey", "biz", "bu", "çok", "çünkü", "da", "daha", "de", "defa",
            "diye", "eğer", "en", "gibi", "hem", "hep", "hepsi", "her", "hiç",
            "için", "ile", "ise", "kez", "ki", "kim", "mı", "mu", "mü", "nasıl",
            "ne", "neden", "nerde", "nerede", "nereye", "niçin", "niye", "o",
            "sanki", "şey", "siz", "şu", "tüm", "ve", "veya", "ya", "yani",
        }
        return stopwords

    def _compile_pii_patterns(self) -> Dict[str, re.Pattern]:
        return {
            "phone": re.compile(r"\b0?[5-9]\d{2}\s?\d{3}\s?\d{2}\s?\d{2}\b"),
            "email": re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b"),
            "tc_no": re.compile(r"\b[1-9]\d{10}\b"),
            "iban": re.compile(r"\bTR\d{2}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{2}\b"),
            "url": re.compile(r"https?://\S+|www\.\S+"),
        }

    def clean_text(self, text: str) -> str:
        if not text:
            return ""
        text = text.lower()
        text = re.sub(r"\s+", " ", text)
        text = re.sub(r"(.)\1{3,}", r"\1\1", text)
        text = text.replace("\n", " ").replace("\r", " ")
        return text.strip()

    def remove_pii(self, text: str, mask: str = "[GİZLİ]") -> str:
        for pii_type, pattern in self.pii_patterns.items():
            text = pattern.sub(f"{mask}_{pii_type.upper()}", text)
        return text

    def tokenize(self, text: str, remove_stop: bool = False) -> List[str]:
        # Basit whitespace tokenization
        tokens = text.split()
        if remove_stop:
            tokens = [t for t in tokens if t.lower() not in self.stopwords]
        return tokens

    def extract_sentences(self, text: str) -> List[str]:
        # Basit cümle ayırma
        sentences = re.split(r'[.!?]+', text)
        return [s.strip() for s in sentences if s.strip()]

    def preprocess(
        self,
        text: str,
        clean: bool = True,
        remove_pii: bool = True,
        remove_stop: bool = False,
    ) -> Dict[str, any]:
        result = {"original": text}

        if clean:
            text = self.clean_text(text)
            result["cleaned"] = text

        if remove_pii:
            text = self.remove_pii(text)
            result["pii_masked"] = text

        result["tokens"] = self.tokenize(text, remove_stop=remove_stop)
        result["lemmas"] = result["tokens"]  # Lemmatization yok, tokenlar döndür
        result["sentences"] = self.extract_sentences(text)
        result["pos_tags"] = []  # POS tagging yok
        result["entities"] = []  # NER yok

        result["stats"] = {
            "char_count": len(text),
            "word_count": len(result["tokens"]),
            "sentence_count": len(result["sentences"]),
            "avg_word_length": sum(len(t) for t in result["tokens"]) / max(len(result["tokens"]), 1),
        }

        return result


# Singleton
_simple_preprocessor = None


def get_simple_preprocessor() -> SimpleTurkishPreprocessor:
    global _simple_preprocessor
    if _simple_preprocessor is None:
        _simple_preprocessor = SimpleTurkishPreprocessor()
    return _simple_preprocessor
