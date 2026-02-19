"""Konuşma Verisi Preprocessor - Enhanced Version

Desteklenen formatlar:
  - WhatsApp (Android & iOS)
  - Telegram (plain text export)
  - Instagram (plain text)
  - Basit "Kişi: Mesaj" formatı

Tarih parsing: python-dateutil ile esnek format desteği
  - 22.01.2024  (Türkiye standart)
  - 01/22/24    (ABD formatı)
  - 2024-01-22  (ISO 8601)
  - 22 Oca 2024 (uzun format)
"""

import logging
import re
from typing import Any

logger = logging.getLogger(__name__)

# python-dateutil — esnek tarih parsing
try:
    from dateutil import parser as dateutil_parser
    from dateutil.parser import ParserError

    _DATEUTIL_AVAILABLE = True
    logger.info("python-dateutil mevcut — esnek tarih parsing aktif")
except ImportError:
    _DATEUTIL_AVAILABLE = False
    logger.warning(
        "python-dateutil kurulu değil. "
        "Yüklemek için: pip install python-dateutil\n"
        "Regex-based tarih parsing kullanılacak."
    )


def _parse_date_flexible(date_str: str, time_str: str = "") -> str:
    """
    Tarih + saat stringini normalize et.

    Türkiye'de gün-önce format yaygın (dayfirst=True).
    Örn: "22.01.2024" → gün=22, ay=01 (dayfirst=True ile doğru)
         "01/22/24"   → gün=01 değil, ay=01 (ABD formatı — dateutil otomatik çözer)

    Returns:
        "YYYY-MM-DD HH:MM" formatında string, veya orijinal string (parse başarısızsa)
    """
    if not _DATEUTIL_AVAILABLE:
        return f"{date_str} {time_str}".strip()

    combined = f"{date_str} {time_str}".strip()
    try:
        # dayfirst=True: Türkiye'de "22.01.2024" → 22. gün, 1. ay
        dt = dateutil_parser.parse(combined, dayfirst=True)
        return dt.strftime("%Y-%m-%d %H:%M")
    except (ParserError, ValueError, OverflowError):
        # Fallback: orijinal string'i döndür
        logger.debug("Tarih parse edilemedi: %s", combined)
        return combined


class ConversationParser:
    """WhatsApp, Telegram ve Instagram formatlarını parse eder"""

    def __init__(self):
        # ── WhatsApp Patterns ──────────────────────────────────────────────
        # Tarih kısmı kasıtlı olarak geniş tutuldu (dateutil parse eder)
        self.whatsapp_patterns = [
            # Android: 01/01/2023, 12:30 - Ahmet: Merhaba
            # Android TR: 22.01.2024 12:30 - Ahmet: Merhaba
            re.compile(
                r"([\d]{1,2}[./\-][\d]{1,2}[./\-][\d]{2,4}),?\s+"
                r"([\d]{1,2}:[\d]{2}(?::[\d]{2})?(?:\s*[APap][Mm])?)"
                r"\s*-\s*([^:]+):\s*(.+)"
            ),
            # iOS: [01/01/2023, 12:30:45] Ahmet: Merhaba
            re.compile(
                r"\[([\d]{1,2}[./\-][\d]{1,2}[./\-][\d]{2,4}),?\s+"
                r"([\d]{1,2}:[\d]{2}(?::[\d]{2})?)\]\s*([^:]+):\s*(.+)"
            ),
            # Android yeni format: 22.01.2024, 12:30 - Ahmet: Merhaba
            re.compile(
                r"([\d]{1,2}\.[\d]{1,2}\.[\d]{2,4}),\s+"
                r"([\d]{1,2}:[\d]{2})\s*-\s*([^:]+):\s*(.+)"
            ),
        ]

        # ── Telegram Patterns ──────────────────────────────────────────────
        self.telegram_patterns = [
            # Plain text: [01.01.23 12:30] Name: Message
            re.compile(
                r"\[([\d]{2}\.[\d]{2}\.[\d]{2,4})\s+([\d]{2}:[\d]{2})\]\s*([^:]+):\s*(.+)"
            ),
            # Telegram Desktop: 01.01.2023 12:30:45, Name: Message
            re.compile(
                r"([\d]{1,2}\.[\d]{1,2}\.[\d]{4})\s+([\d]{2}:[\d]{2}:[\d]{2}),\s*([^:]+):\s*(.+)"
            ),
        ]

        # ── Instagram Patterns ─────────────────────────────────────────────
        self.instagram_patterns = [
            # Plain text: Name, 01 Jan 2023 12:30:45: Message
            re.compile(r"([^,]+),\s+(\d{1,2}\s+\w+\s+\d{4}\s+\d{2}:\d{2}:\d{2}):\s*(.+)"),
        ]

        # ── System Message Exclusions ──────────────────────────────────────
        self.system_message_patterns = [
            # WhatsApp
            r"<Media omitted>",
            r"<Medya dahil edilmedi>",
            r"güvenlik kodu değişti",
            r"security code changed",
            r"Messages and calls are end-to-end encrypted",
            r"Mesajlar ve aramalar uçtan uca şifrelidir",
            r"created group",
            r"grup oluşturdu",
            r"added",
            r"ekledi",
            r"removed",
            r"çıkardı",
            r"left",
            r"ayrıldı",
            r"changed the subject",
            r"konuyu değiştirdi",
            r"changed this group's icon",
            r"grubun simgesini değiştirdi",
            r"deleted this message",
            r"bu mesajı sildi",
            r"This message was deleted",
            r"Bu mesaj silindi",
            r"Missed voice call",
            r"Cevapsız sesli arama",
            r"Missed video call",
            r"Cevapsız görüntülü arama",
            r"Call ended",
            r"Arama sona erdi",
            # Telegram
            r"joined the group",
            r"gruba katıldı",
            r"invited",
            r"davet etti",
            r"pinned a message",
            r"mesajı sabitledi",
            r"changed the chat photo",
            r"sohbet fotoğrafını değiştirdi",
            # Instagram
            r"liked a message",
            r"mesajı beğendi",
            r"reacted",
            r"tepki verdi",
            r"started a video chat",
            r"görüntülü sohbet başlattı",
        ]

        self.compiled_system_patterns = [
            re.compile(pattern, re.IGNORECASE) for pattern in self.system_message_patterns
        ]

    # ──────────────────────────────────────────────────────────────────────
    # Helpers
    # ──────────────────────────────────────────────────────────────────────

    def is_system_message(self, content: str) -> bool:
        """Sistem mesajı olup olmadığını kontrol et"""
        for pattern in self.compiled_system_patterns:
            if pattern.search(content):
                return True
        return False

    def _make_message(
        self,
        date_str: str,
        time_str: str,
        sender: str,
        content: str,
        platform: str,
    ) -> dict[str, Any]:
        """Normalize edilmiş mesaj dict'i oluştur"""
        return {
            "timestamp": _parse_date_flexible(date_str, time_str),
            "sender": sender.strip(),
            "content": content.strip(),
            "platform": platform,
        }

    # ──────────────────────────────────────────────────────────────────────
    # Platform parsers
    # ──────────────────────────────────────────────────────────────────────

    def parse_whatsapp_export(self, text: str) -> list[dict[str, Any]]:
        """WhatsApp export dosyasını parse et"""
        messages: list[dict[str, Any]] = []
        lines = text.split("\n")

        for line in lines:
            line = line.strip()
            if not line:
                continue

            for pattern in self.whatsapp_patterns:
                match = pattern.match(line)
                if match:
                    date_str, time_str, sender, content = match.groups()
                    if self.is_system_message(content):
                        continue
                    messages.append(
                        self._make_message(date_str, time_str, sender, content, "whatsapp")
                    )
                    break

        return messages

    def parse_telegram_export(self, text: str) -> list[dict[str, Any]]:
        """Telegram export dosyasını parse et"""
        messages: list[dict[str, Any]] = []
        lines = text.split("\n")

        for line in lines:
            line = line.strip()
            if not line:
                continue

            for pattern in self.telegram_patterns:
                match = pattern.match(line)
                if match:
                    date_str, time_str, sender, content = match.groups()
                    if self.is_system_message(content):
                        continue
                    messages.append(
                        self._make_message(date_str, time_str, sender, content, "telegram")
                    )
                    break

        return messages

    def parse_instagram_export(self, text: str) -> list[dict[str, Any]]:
        """Instagram export dosyasını parse et"""
        messages: list[dict[str, Any]] = []
        lines = text.split("\n")

        for line in lines:
            line = line.strip()
            if not line:
                continue

            for pattern in self.instagram_patterns:
                match = pattern.match(line)
                if match:
                    sender, timestamp, content = match.groups()
                    if self.is_system_message(content):
                        continue
                    # Instagram timestamp is already a full string
                    messages.append(
                        {
                            "timestamp": _parse_date_flexible(timestamp),
                            "sender": sender.strip(),
                            "content": content.strip(),
                            "platform": "instagram",
                        }
                    )
                    break

        return messages

    def parse_simple_format(self, text: str) -> list[dict[str, Any]]:
        """Basit format: Her satır bir mesaj (Kişi: Mesaj)"""
        messages: list[dict[str, Any]] = []
        lines = text.split("\n")

        for line in lines:
            line = line.strip()
            if not line:
                continue

            if ":" in line:
                parts = line.split(":", 1)
                if len(parts) == 2:
                    messages.append(
                        {
                            "timestamp": None,
                            "sender": parts[0].strip(),
                            "content": parts[1].strip(),
                            "platform": "simple",
                        }
                    )
            else:
                if messages:
                    messages[-1]["content"] += " " + line
                else:
                    messages.append(
                        {
                            "timestamp": None,
                            "sender": "Unknown",
                            "content": line,
                            "platform": "simple",
                        }
                    )

        return messages

    # ──────────────────────────────────────────────────────────────────────
    # Auto-detection & stats
    # ──────────────────────────────────────────────────────────────────────

    def detect_platform(self, text: str) -> str:
        """Platform otomatik tespiti"""
        if any(pattern.search(text) for pattern in self.whatsapp_patterns):
            return "whatsapp"
        if any(pattern.search(text) for pattern in self.telegram_patterns):
            return "telegram"
        if any(pattern.search(text) for pattern in self.instagram_patterns):
            return "instagram"
        if text.strip().startswith("{") or text.strip().startswith("["):
            return "json"
        return "simple"

    def identify_participants(self, messages: list[dict[str, Any]]) -> list[str]:
        """Konuşmaya katılanları tespit et"""
        participants: set[str] = set()
        for msg in messages:
            sender = msg.get("sender")
            if sender:
                participants.add(sender)
        return sorted(list(participants))

    def split_by_participant(
        self, messages: list[dict[str, Any]]
    ) -> dict[str, list[dict[str, Any]]]:
        """Mesajları kişilere göre ayır"""
        by_participant: dict[str, list[dict[str, Any]]] = {}
        for msg in messages:
            sender = msg.get("sender", "Unknown")
            if sender not in by_participant:
                by_participant[sender] = []
            by_participant[sender].append(msg)
        return by_participant

    def calculate_conversation_stats(self, messages: list[dict[str, Any]]) -> dict[str, Any]:
        """Konuşma istatistikleri"""
        if not messages:
            return {
                "total_messages": 0,
                "participant_count": 0,
                "participants": [],
                "message_distribution": {},
                "avg_message_length": 0,
                "total_words": 0,
            }

        participants = self.identify_participants(messages)
        by_participant = self.split_by_participant(messages)

        stats: dict[str, Any] = {
            "total_messages": len(messages),
            "participant_count": len(participants),
            "participants": participants,
            "message_distribution": {},
            "avg_message_length": 0,
            "total_words": 0,
        }

        total_chars = 0
        total_words = 0

        for participant, msgs in by_participant.items():
            msg_count = len(msgs)
            chars = sum(len(m["content"]) for m in msgs)
            words = sum(len(m["content"].split()) for m in msgs)

            stats["message_distribution"][participant] = {
                "count": msg_count,
                "percentage": (msg_count / len(messages)) * 100,
                "avg_length": chars / msg_count if msg_count > 0 else 0,
                "total_words": words,
            }

            total_chars += chars
            total_words += words

        stats["avg_message_length"] = total_chars / len(messages) if messages else 0
        stats["total_words"] = total_words

        return stats

    def parse(self, text: str, format_type: str = "auto") -> dict[str, Any]:
        """
        Konuşmayı parse et

        Args:
            text: Ham metin
            format_type: 'auto', 'whatsapp', 'telegram', 'instagram', 'simple'
        """
        messages: list[dict[str, Any]] = []

        if format_type == "auto":
            detected_platform = self.detect_platform(text)
            if detected_platform == "whatsapp":
                messages = self.parse_whatsapp_export(text)
            elif detected_platform == "telegram":
                messages = self.parse_telegram_export(text)
            elif detected_platform == "instagram":
                messages = self.parse_instagram_export(text)
            else:
                messages = self.parse_simple_format(text)
        elif format_type == "whatsapp":
            messages = self.parse_whatsapp_export(text)
        elif format_type == "telegram":
            messages = self.parse_telegram_export(text)
        elif format_type == "instagram":
            messages = self.parse_instagram_export(text)
        elif format_type == "simple":
            messages = self.parse_simple_format(text)

        stats = self.calculate_conversation_stats(messages)
        detected_format = messages[0].get("platform", "simple") if messages else "simple"

        return {
            "messages": messages,
            "stats": stats,
            "format": detected_format,
            "format_detected": detected_format,
            "messages_by_participant": self.split_by_participant(messages),
        }
