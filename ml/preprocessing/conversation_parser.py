"""Konuşma Verisi Preprocessor"""

import re


class ConversationParser:
    """WhatsApp ve genel konuşma formatlarını parse eder"""

    def __init__(self):
        # WhatsApp format patterns (iOS & Android)
        self.whatsapp_patterns = [
            # Android: 01/01/2023, 12:30 - Ahmet: Merhaba
            re.compile(r"(\d{1,2}/\d{1,2}/\d{2,4}),?\s+(\d{1,2}:\d{2})\s*-\s*([^:]+):\s*(.+)"),
            # iOS: [01/01/2023, 12:30:45] Ahmet: Merhaba
            re.compile(
                r"\[(\d{1,2}/\d{1,2}/\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?)\]\s*([^:]+):\s*(.+)"
            ),
        ]

    def parse_whatsapp_export(self, text: str) -> list[dict[str, any]]:
        """WhatsApp export dosyasını parse et"""
        messages = []
        lines = text.split("\n")

        for line in lines:
            line = line.strip()
            if not line:
                continue

            # Her pattern'i dene
            for pattern in self.whatsapp_patterns:
                match = pattern.match(line)
                if match:
                    date_str, time_str, sender, content = match.groups()

                    # Sistem mesajlarını atla
                    if "<Media omitted>" in content or "güvenlik kodu değişti" in content.lower():
                        continue

                    messages.append(
                        {
                            "timestamp": f"{date_str} {time_str}",
                            "sender": sender.strip(),
                            "content": content.strip(),
                        }
                    )
                    break

        return messages

    def parse_simple_format(self, text: str) -> list[dict[str, any]]:
        """Basit format: Her satır bir mesaj (Kişi: Mesaj)"""
        messages = []
        lines = text.split("\n")

        for idx, line in enumerate(lines):
            line = line.strip()
            if not line:
                continue

            # Format: "Kişi: Mesaj" veya sadece mesaj
            if ":" in line:
                parts = line.split(":", 1)
                if len(parts) == 2:
                    messages.append(
                        {
                            "timestamp": None,
                            "sender": parts[0].strip(),
                            "content": parts[1].strip(),
                        }
                    )
            else:
                # Sender belirtilmemişse önceki mesajın devamı olabilir
                if messages:
                    messages[-1]["content"] += " " + line
                else:
                    messages.append(
                        {
                            "timestamp": None,
                            "sender": "Unknown",
                            "content": line,
                        }
                    )

        return messages

    def identify_participants(self, messages: list[dict[str, any]]) -> list[str]:
        """Konuşmaya katılanları tespit et"""
        participants = set()
        for msg in messages:
            sender = msg.get("sender")
            if sender:
                participants.add(sender)
        return sorted(list(participants))

    def split_by_participant(
        self, messages: list[dict[str, any]]
    ) -> dict[str, list[dict[str, any]]]:
        """Mesajları kişilere göre ayır"""
        by_participant = {}
        for msg in messages:
            sender = msg.get("sender", "Unknown")
            if sender not in by_participant:
                by_participant[sender] = []
            by_participant[sender].append(msg)
        return by_participant

    def calculate_conversation_stats(self, messages: list[dict[str, any]]) -> dict[str, any]:
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

        stats = {
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

    def parse(self, text: str, format_type: str = "auto") -> dict[str, any]:
        """
        Konuşmayı parse et

        Args:
            text: Ham metin
            format_type: 'auto', 'whatsapp', 'simple'
        """
        messages = []

        if format_type == "auto":
            # Otomatik format tespiti
            if any(pattern.search(text) for pattern in self.whatsapp_patterns):
                messages = self.parse_whatsapp_export(text)
            else:
                messages = self.parse_simple_format(text)
        elif format_type == "whatsapp":
            messages = self.parse_whatsapp_export(text)
        elif format_type == "simple":
            messages = self.parse_simple_format(text)

        # İstatistikler
        stats = self.calculate_conversation_stats(messages)

        detected_format = "whatsapp" if any(m.get("timestamp") for m in messages) else "simple"

        return {
            "messages": messages,
            "stats": stats,
            "format": detected_format,
            "format_detected": detected_format,
            "messages_by_participant": self.split_by_participant(messages),
        }
