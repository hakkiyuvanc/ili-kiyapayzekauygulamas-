"""Türkçe Metin Ön İşleme Modülü"""

import logging
import re

import spacy

logger = logging.getLogger(__name__)


class TurkishPreprocessor:
    """Türkçe metin ön işleme ve temizleme"""

    def __init__(self, model_name: str = "tr_core_news_md"):
        """
        Args:
            model_name: spaCy Türkçe model adı (varsayılan: md - hafif ve hızlı)
        """
        # Önce istenen modeli dene, sonra alternatifleri
        model_candidates = [model_name]
        if model_name == "tr_core_news_md":
            model_candidates.append("tr_core_news_lg")  # md yoksa lg dene
        elif model_name == "tr_core_news_lg":
            model_candidates.insert(0, "tr_core_news_md")  # lg istense de md'yi önce dene

        loaded = False
        for candidate in model_candidates:
            try:
                self.nlp = spacy.load(candidate)
                logger.info("SpaCy Türkçe modeli yüklendi: %s", candidate)
                loaded = True
                break
            except OSError:
                logger.debug("Model bulunamadı: %s", candidate)
                continue

        if not loaded:
            logger.warning(
                "Türkçe SpaCy modeli bulunamadı. Boş model kullanılıyor.\n"
                "Tam model için: python -m spacy download tr_core_news_md"
            )
            self.nlp = spacy.blank("tr")
            if "sentencizer" not in self.nlp.pipe_names:
                self.nlp.add_pipe("sentencizer")
            logger.info("Boş Türkçe spaCy modeli oluşturuldu (sentencizer ile)")

        # Türkçe stopwords
        self.stopwords = self._load_turkish_stopwords()

        # PII patterns
        self.pii_patterns = self._compile_pii_patterns()

    def _load_turkish_stopwords(self) -> set[str]:
        """Türkçe stopword'leri yükle"""
        # Temel Türkçe stopword listesi
        stopwords = {
            "acaba",
            "ama",
            "aslında",
            "az",
            "bazı",
            "belki",
            "biri",
            "birkaç",
            "birşey",
            "biz",
            "bu",
            "çok",
            "çünkü",
            "da",
            "daha",
            "de",
            "defa",
            "diye",
            "eğer",
            "en",
            "gibi",
            "hem",
            "hep",
            "hepsi",
            "her",
            "hiç",
            "için",
            "ile",
            "ise",
            "kez",
            "ki",
            "kim",
            "mı",
            "mu",
            "mü",
            "nasıl",
            "ne",
            "neden",
            "nerde",
            "nerede",
            "nereye",
            "niçin",
            "niye",
            "o",
            "sanki",
            "şey",
            "siz",
            "şu",
            "tüm",
            "ve",
            "veya",
            "ya",
            "yani",
        }
        return stopwords

    def _compile_pii_patterns(self) -> dict[str, re.Pattern]:
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

    def tokenize(self, text: str, remove_stop: bool = False) -> list[str]:
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

    def lemmatize(self, text: str) -> list[str]:
        """Metni lemmatize et (kök forma indir)"""
        doc = self.nlp(text)
        return [token.lemma_ for token in doc if not token.is_punct and not token.is_space]

    def extract_sentences(self, text: str) -> list[str]:
        """Cümlelere ayır"""
        doc = self.nlp(text)
        return [sent.text.strip() for sent in doc.sents]

    def get_pos_tags(self, text: str) -> list[tuple]:
        """Part-of-speech tagging"""
        doc = self.nlp(text)
        return [(token.text, token.pos_) for token in doc]

    def extract_entities(self, text: str) -> list[dict[str, str]]:
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
    ) -> dict[str, any]:
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
            "avg_word_length": sum(len(t) for t in result["tokens"])
            / max(len(result["tokens"]), 1),
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
