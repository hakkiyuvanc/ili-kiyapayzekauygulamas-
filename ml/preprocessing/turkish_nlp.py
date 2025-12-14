"""Türkçe Metin Ön İşleme Modülü"""

import re
import string
from typing import List, Dict, Set
import spacy
from spacy.language import Language


class TurkishPreprocessor:
    """Türkçe metin ön işleme ve temizleme"""

    def __init__(self, model_name: str = "tr_core_news_lg"):
        """
        Args:
            model_name: spaCy Türkçe model adı
        """
        try:
            self.nlp = spacy.load(model_name)
        except OSError:
            print(f"Model {model_name} bulunamadı. Yükleniyor...")
            import subprocess
            subprocess.run(["python", "-m", "spacy", "download", model_name])
            self.nlp = spacy.load(model_name)

        # Türkçe stopwords
        self.stopwords = self._load_turkish_stopwords()
        
        # PII patterns
        self.pii_patterns = self._compile_pii_patterns()

    def _load_turkish_stopwords(self) -> Set[str]:
        """Türkçe stopword'leri yükle"""
        # Temel Türkçe stopword listesi
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
        """PII (Kişisel Bilgi) tespit kalıpları"""
        return {
            "phone": re.compile(r"\b0?[5-9]\d{2}\s?\d{3}\s?\d{2}\s?\d{2}\b"),
            "email": re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b"),
            "tc_no": re.compile(r"\b[1-9]\d{10}\b"),
            "iban": re.compile(r"\bTR\d{2}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{2}\b"),
            "url": re.compile(r"https?://\S+|www\.\S+"),
        }

    def clean_text(self, text: str) -> str:
        """Metni temizle ve normalize et"""
        if not text:
            return ""

        # Küçük harfe çevir (Türkçe karakter desteği)
        text = text.lower()

        # Fazla boşlukları temizle
        text = re.sub(r"\s+", " ", text)

        # Emoji ve özel karakterleri koru ama fazlalıkları temizle
        text = re.sub(r"(.)\1{3,}", r"\1\1", text)  # 3'ten fazla tekrar eden karakter

        # Satır sonlarını düzenle
        text = text.replace("\n", " ").replace("\r", " ")

        return text.strip()

    def remove_pii(self, text: str, mask: str = "[GİZLİ]") -> str:
        """Kişisel bilgileri maskele"""
        for pii_type, pattern in self.pii_patterns.items():
            text = pattern.sub(f"{mask}_{pii_type.upper()}", text)
        return text

    def tokenize(self, text: str, remove_stop: bool = False) -> List[str]:
        """Metni tokenize et"""
        doc = self.nlp(text)
        
        tokens = []
        for token in doc:
            # Noktalama ve boşlukları atla
            if token.is_punct or token.is_space:
                continue
            
            # Stopword kontrolü
            if remove_stop and token.text.lower() in self.stopwords:
                continue
            
            tokens.append(token.text)
        
        return tokens

    def lemmatize(self, text: str) -> List[str]:
        """Metni lemmatize et (kök forma indir)"""
        doc = self.nlp(text)
        return [token.lemma_ for token in doc if not token.is_punct and not token.is_space]

    def extract_sentences(self, text: str) -> List[str]:
        """Cümlelere ayır"""
        doc = self.nlp(text)
        return [sent.text.strip() for sent in doc.sents]

    def get_pos_tags(self, text: str) -> List[tuple]:
        """Part-of-speech tagging"""
        doc = self.nlp(text)
        return [(token.text, token.pos_) for token in doc]

    def extract_entities(self, text: str) -> List[Dict[str, str]]:
        """Named Entity Recognition"""
        doc = self.nlp(text)
        return [
            {
                "text": ent.text,
                "label": ent.label_,
                "start": ent.start_char,
                "end": ent.end_char,
            }
            for ent in doc.ents
        ]

    def preprocess(
        self,
        text: str,
        clean: bool = True,
        remove_pii: bool = True,
        remove_stop: bool = False,
    ) -> Dict[str, any]:
        """Tam preprocessing pipeline"""
        result = {"original": text}

        # Temizlik
        if clean:
            text = self.clean_text(text)
            result["cleaned"] = text

        # PII maskeleme
        if remove_pii:
            text = self.remove_pii(text)
            result["pii_masked"] = text

        # Tokenization
        result["tokens"] = self.tokenize(text, remove_stop=remove_stop)
        result["lemmas"] = self.lemmatize(text)
        result["sentences"] = self.extract_sentences(text)
        result["pos_tags"] = self.get_pos_tags(text)
        result["entities"] = self.extract_entities(text)

        # İstatistikler
        result["stats"] = {
            "char_count": len(text),
            "word_count": len(result["tokens"]),
            "sentence_count": len(result["sentences"]),
            "avg_word_length": sum(len(t) for t in result["tokens"]) / max(len(result["tokens"]), 1),
        }

        return result


# Singleton instance
_preprocessor_instance = None


def get_preprocessor() -> TurkishPreprocessor:
    """Preprocessor singleton instance"""
    global _preprocessor_instance
    if _preprocessor_instance is None:
        _preprocessor_instance = TurkishPreprocessor()
    return _preprocessor_instance
