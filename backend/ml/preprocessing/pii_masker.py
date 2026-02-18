"""PII (Personally Identifiable Information) Masking Module

Bu modül, konuşma metinlerinden kişisel verileri tespit edip anonimleştirir.
SpaCy NER (Named Entity Recognition) kullanır.

Model yükleme önceliği: tr_core_news_md → tr_core_news_lg → regex fallback
"""

import logging
import re
from typing import Any

logger = logging.getLogger(__name__)


class PIIMasker:
    """Kişisel verileri tespit edip maskeler"""

    def __init__(self, use_spacy: bool = True):
        """
        Args:
            use_spacy: SpaCy NER kullan (False ise regex-based fallback)
        """
        self.use_spacy = use_spacy
        self.nlp = None
        self.mapping_table = {}  # {masked_value: original_value}
        self.reverse_mapping = {}  # {original_value: masked_value}
        self.entity_counters = {
            "PERSON": 0,
            "LOC": 0,
            "ORG": 0,
            "PHONE": 0,
            "EMAIL": 0,
        }

        # SpaCy modelini yükle (md → lg → regex fallback)
        if self.use_spacy:
            try:
                import spacy

                # Önce hafif modeli dene (md ~50MB), sonra büyüğü (lg ~500MB)
                loaded = False
                for model_name in ["tr_core_news_md", "tr_core_news_lg"]:
                    try:
                        self.nlp = spacy.load(model_name)
                        logger.info("SpaCy modeli yüklendi: %s", model_name)
                        loaded = True
                        break
                    except OSError:
                        logger.debug("SpaCy modeli bulunamadı: %s", model_name)
                        continue

                if not loaded:
                    logger.warning(
                        "Türkçe SpaCy modeli bulunamadı. "
                        "Yüklemek için: python -m spacy download tr_core_news_md\n"
                        "Regex tabanlı PII maskelemeye geçiliyor."
                    )
                    self.use_spacy = False
            except ImportError:
                logger.warning("SpaCy kurulu değil, regex-based masking kullanılacak")
                self.use_spacy = False

        # Regex patterns for fallback
        self.phone_pattern = re.compile(
            r"(\+?90\s?)?(\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{2}[\s.-]?\d{2})"
        )
        self.email_pattern = re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b")

        # Turkish name patterns (common first names)
        self.turkish_names = [
            "Ahmet",
            "Mehmet",
            "Mustafa",
            "Ali",
            "Hüseyin",
            "İbrahim",
            "Hasan",
            "İsmail",
            "Ömer",
            "Fatma",
            "Ayşe",
            "Emine",
            "Hatice",
            "Zeynep",
            "Elif",
            "Meryem",
            "Şerife",
            "Havva",
        ]

    def _generate_masked_value(self, entity_type: str) -> str:
        """Masked değer oluştur (örn: [KULLANICI_1])"""
        self.entity_counters[entity_type] += 1
        count = self.entity_counters[entity_type]

        type_map = {
            "PERSON": "KULLANICI",
            "LOC": "KONUM",
            "ORG": "KURUM",
            "PHONE": "TELEFON",
            "EMAIL": "EMAIL",
        }

        masked_name = type_map.get(entity_type, "ENTITY")
        return f"[{masked_name}_{count}]"

    def mask_with_spacy(self, text: str) -> tuple[str, dict[str, str]]:
        """SpaCy NER ile maskeleme"""
        if not self.nlp:
            return self.mask_with_regex(text)

        doc = self.nlp(text)
        masked_text = text
        local_mapping = {}

        # Entities'i geriye doğru işle (index kaymalarını önlemek için)
        for ent in reversed(doc.ents):
            if ent.label_ in ["PERSON", "LOC", "ORG"]:
                original = ent.text

                # Zaten maskelenmiş mi kontrol et
                if original in self.reverse_mapping:
                    masked = self.reverse_mapping[original]
                else:
                    masked = self._generate_masked_value(ent.label_)
                    self.mapping_table[masked] = original
                    self.reverse_mapping[original] = masked

                local_mapping[masked] = original

                # Metinde değiştir
                masked_text = masked_text[: ent.start_char] + masked + masked_text[ent.end_char :]

        return masked_text, local_mapping

    def mask_with_regex(self, text: str) -> tuple[str, dict[str, str]]:
        """Regex-based fallback maskeleme"""
        masked_text = text
        local_mapping = {}

        # Telefon numaralarını maskele
        for match in self.phone_pattern.finditer(text):
            phone = match.group(0)
            if phone not in self.reverse_mapping:
                masked = self._generate_masked_value("PHONE")
                self.mapping_table[masked] = phone
                self.reverse_mapping[phone] = masked
            else:
                masked = self.reverse_mapping[phone]

            local_mapping[masked] = phone
            masked_text = masked_text.replace(phone, masked)

        # Email adreslerini maskele
        for match in self.email_pattern.finditer(text):
            email = match.group(0)
            if email not in self.reverse_mapping:
                masked = self._generate_masked_value("EMAIL")
                self.mapping_table[masked] = email
                self.reverse_mapping[email] = masked
            else:
                masked = self.reverse_mapping[email]

            local_mapping[masked] = email
            masked_text = masked_text.replace(email, masked)

        # Türkçe isimleri maskele (basit pattern matching)
        for name in self.turkish_names:
            pattern = re.compile(r"\b" + re.escape(name) + r"\b", re.IGNORECASE)
            for match in pattern.finditer(masked_text):
                original = match.group(0)
                if original not in self.reverse_mapping:
                    masked = self._generate_masked_value("PERSON")
                    self.mapping_table[masked] = original
                    self.reverse_mapping[original] = masked
                else:
                    masked = self.reverse_mapping[original]

                local_mapping[masked] = original
                masked_text = masked_text.replace(original, masked, 1)

        return masked_text, local_mapping

    def mask_messages(self, messages: list[dict[str, Any]]) -> list[dict[str, Any]]:
        """Mesaj listesini maskele"""
        masked_messages = []

        for msg in messages:
            content = msg.get("content", "")
            sender = msg.get("sender", "")

            # İçeriği maskele
            if self.use_spacy:
                masked_content, _ = self.mask_with_spacy(content)
            else:
                masked_content, _ = self.mask_with_regex(content)

            # Sender'ı maskele
            if sender and sender not in self.reverse_mapping:
                masked_sender = self._generate_masked_value("PERSON")
                self.mapping_table[masked_sender] = sender
                self.reverse_mapping[sender] = masked_sender
            else:
                masked_sender = self.reverse_mapping.get(sender, sender)

            masked_msg = msg.copy()
            masked_msg["content"] = masked_content
            masked_msg["sender"] = masked_sender
            masked_msg["original_sender"] = sender  # Orijinali sakla

            masked_messages.append(masked_msg)

        return masked_messages

    def unmask_text(self, masked_text: str) -> str:
        """Maskelenmiş metni orijinal haline döndür"""
        unmasked = masked_text

        for masked, original in self.mapping_table.items():
            unmasked = unmasked.replace(masked, original)

        return unmasked

    def unmask_response(self, response: dict[str, Any]) -> dict[str, Any]:
        """AI yanıtını unmask et (tüm string değerleri)"""
        if isinstance(response, dict):
            return {k: self.unmask_response(v) for k, v in response.items()}
        elif isinstance(response, list):
            return [self.unmask_response(item) for item in response]
        elif isinstance(response, str):
            return self.unmask_text(response)
        else:
            return response

    def get_mapping_table(self) -> dict[str, str]:
        """Mapping table'ı döndür"""
        return self.mapping_table.copy()

    def reset(self):
        """Mapping table'ı sıfırla"""
        self.mapping_table = {}
        self.reverse_mapping = {}
        self.entity_counters = {
            "PERSON": 0,
            "LOC": 0,
            "ORG": 0,
            "PHONE": 0,
            "EMAIL": 0,
        }
