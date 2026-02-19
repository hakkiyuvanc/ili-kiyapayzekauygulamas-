"""PII (Personally Identifiable Information) Masking Module

Bu modül, konuşma metinlerinden kişisel verileri tespit edip anonimleştirir.
SpaCy NER (Named Entity Recognition) kullanır.

Maskeleme formatı:
  [İSİM]   → Kişi adları (PERSON)
  [KONUM]  → Yer adları (LOC)
  [KURUM]  → Kurum/Organizasyon (ORG)
  [TELEFON] → Telefon numaraları
  [EMAIL]  → E-posta adresleri

Model yükleme önceliği: tr_core_news_md → tr_core_news_lg → regex fallback
"""

import logging
import re
from typing import Any

logger = logging.getLogger(__name__)


class PIIMasker:
    """Kişisel verileri tespit edip maskeler"""

    # Maskeleme etiketleri (kullanıcı tarafından görünen format)
    LABEL_MAP = {
        "PERSON": "[İSİM]",
        "PER": "[İSİM]",
        "LOC": "[KONUM]",
        "GPE": "[KONUM]",
        "ORG": "[KURUM]",
        "PHONE": "[TELEFON]",
        "EMAIL": "[EMAIL]",
    }

    def __init__(self, use_spacy: bool = True):
        """
        Args:
            use_spacy: SpaCy NER kullan (False ise regex-based fallback)
        """
        self.use_spacy = use_spacy
        self.nlp = None
        self.mapping_table: dict[str, str] = {}   # {masked_label: original_value}
        self.reverse_mapping: dict[str, str] = {}  # {original_value: masked_label}
        self._entity_seen: dict[str, str] = {}     # {original: masked} — same entity → same label

        # SpaCy modelini yükle (md → lg → regex fallback)
        if self.use_spacy:
            try:
                import spacy

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

        # Regex patterns for fallback / always-on masking
        self.phone_pattern = re.compile(
            r"(\+?90\s?)?(\(?\d{3}\)?[\s.\-]?\d{3}[\s.\-]?\d{2}[\s.\-]?\d{2})"
        )
        self.email_pattern = re.compile(r"\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Z|a-z]{2,}\b")

        # Turkish name patterns (common first names — regex fallback only)
        self.turkish_names = [
            "Ahmet", "Mehmet", "Mustafa", "Ali", "Hüseyin", "İbrahim",
            "Hasan", "İsmail", "Ömer", "Fatma", "Ayşe", "Emine",
            "Hatice", "Zeynep", "Elif", "Meryem", "Şerife", "Havva",
        ]

    # ──────────────────────────────────────────────────────────────────────
    # Internal helpers
    # ──────────────────────────────────────────────────────────────────────

    def _get_or_create_mask(self, original: str, entity_type: str) -> str:
        """Aynı varlık için her zaman aynı maskeyi döndür."""
        if original in self._entity_seen:
            return self._entity_seen[original]

        label = self.LABEL_MAP.get(entity_type, "[VERİ]")
        self._entity_seen[original] = label
        self.mapping_table[label] = original   # son görülen değeri sakla
        self.reverse_mapping[original] = label
        return label

    # ──────────────────────────────────────────────────────────────────────
    # Masking methods
    # ──────────────────────────────────────────────────────────────────────

    def mask_with_spacy(self, text: str) -> tuple[str, dict[str, str]]:
        """SpaCy NER ile maskeleme"""
        if not self.nlp:
            return self.mask_with_regex(text)

        doc = self.nlp(text)
        masked_text = text
        local_mapping: dict[str, str] = {}

        # Entities'i geriye doğru işle (index kaymalarını önlemek için)
        for ent in reversed(doc.ents):
            if ent.label_ in self.LABEL_MAP:
                original = ent.text
                masked = self._get_or_create_mask(original, ent.label_)
                local_mapping[masked] = original
                masked_text = masked_text[: ent.start_char] + masked + masked_text[ent.end_char :]

        # Always apply regex for phones/emails (SpaCy misses these)
        masked_text, regex_mapping = self._mask_phones_and_emails(masked_text)
        local_mapping.update(regex_mapping)

        return masked_text, local_mapping

    def mask_with_regex(self, text: str) -> tuple[str, dict[str, str]]:
        """Regex-based fallback maskeleme"""
        masked_text, local_mapping = self._mask_phones_and_emails(text)

        # Türkçe isimleri maskele (basit pattern matching)
        for name in self.turkish_names:
            pattern = re.compile(r"\b" + re.escape(name) + r"\b", re.IGNORECASE)
            for match in pattern.finditer(masked_text):
                original = match.group(0)
                masked = self._get_or_create_mask(original, "PERSON")
                local_mapping[masked] = original
                masked_text = masked_text.replace(original, masked, 1)

        return masked_text, local_mapping

    def _mask_phones_and_emails(self, text: str) -> tuple[str, dict[str, str]]:
        """Telefon ve e-posta adreslerini maskele"""
        masked_text = text
        local_mapping: dict[str, str] = {}

        for match in self.phone_pattern.finditer(text):
            phone = match.group(0)
            masked = self._get_or_create_mask(phone, "PHONE")
            local_mapping[masked] = phone
            masked_text = masked_text.replace(phone, masked)

        for match in self.email_pattern.finditer(text):
            email = match.group(0)
            masked = self._get_or_create_mask(email, "EMAIL")
            local_mapping[masked] = email
            masked_text = masked_text.replace(email, masked)

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
            masked_sender = self._get_or_create_mask(sender, "PERSON") if sender else sender

            masked_msg = msg.copy()
            masked_msg["content"] = masked_content
            masked_msg["sender"] = masked_sender
            masked_msg["original_sender"] = sender  # Orijinali sakla

            masked_messages.append(masked_msg)

        return masked_messages

    # ──────────────────────────────────────────────────────────────────────
    # Unmasking
    # ──────────────────────────────────────────────────────────────────────

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

    # ──────────────────────────────────────────────────────────────────────
    # Utilities
    # ──────────────────────────────────────────────────────────────────────

    def get_mapping_table(self) -> dict[str, str]:
        """Mapping table'ı döndür"""
        return self.mapping_table.copy()

    def reset(self):
        """Tüm mapping tablolarını sıfırla"""
        self.mapping_table = {}
        self.reverse_mapping = {}
        self._entity_seen = {}
