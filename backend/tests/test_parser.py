"""Unit Tests for Conversation Parser"""

import sys
import unittest

sys.path.insert(0, "/Users/hakkiyuvanc/GİTHUB/ilişki yapay zeka/ili-kiyapayzekauygulamas-")

from ml.preprocessing.conversation_parser import ConversationParser


class TestConversationParser(unittest.TestCase):
    """Test cases for ConversationParser"""

    def setUp(self):
        """Set up test fixtures"""
        self.parser = ConversationParser()

    def test_parse_simple_format(self):
        """Test simple format parsing"""
        text = """Ali: Merhaba
Ayşe: Selam
Ali: Nasılsın?"""

        result = self.parser.parse(text, format_type="simple")

        self.assertEqual(result["format"], "simple")
        self.assertEqual(result["stats"]["total_messages"], 3)
        self.assertEqual(result["stats"]["participant_count"], 2)

    def test_parse_whatsapp_android(self):
        """Test WhatsApp Android format"""
        text = """25/12/2024, 14:30 - Ali: Merhaba
25/12/2024, 14:31 - Ayşe: Selam"""

        result = self.parser.parse(text, format_type="whatsapp")

        self.assertEqual(result["format"], "whatsapp")
        self.assertEqual(result["stats"]["total_messages"], 2)

    def test_parse_whatsapp_ios(self):
        """Test WhatsApp iOS format"""
        text = """[25/12/2024, 14:30:00] Ali: Merhaba
[25/12/2024, 14:31:00] Ayşe: Selam"""

        result = self.parser.parse(text, format_type="whatsapp")

        self.assertEqual(result["format"], "whatsapp")
        self.assertEqual(result["stats"]["total_messages"], 2)

    def test_parse_auto_detect(self):
        """Test automatic format detection"""
        whatsapp_text = """25/12/2024, 14:30 - Ali: Test"""
        result = self.parser.parse(whatsapp_text, format_type="auto")

        self.assertEqual(result["format"], "whatsapp")

    def test_split_by_participant(self):
        """Test splitting messages by participant"""
        text = """Ali: Mesaj 1
Ayşe: Mesaj 2
Ali: Mesaj 3"""

        result = self.parser.parse(text, format_type="simple")
        messages_by_participant = result["messages_by_participant"]

        self.assertEqual(len(messages_by_participant["Ali"]), 2)
        self.assertEqual(len(messages_by_participant["Ayşe"]), 1)

    def test_empty_text(self):
        """Test parsing empty text"""
        result = self.parser.parse("", format_type="simple")

        self.assertEqual(result["stats"]["total_messages"], 0)
        self.assertEqual(result["stats"]["participant_count"], 0)

    def test_single_participant(self):
        """Test single participant conversation"""
        text = """Ali: Mesaj 1
Ali: Mesaj 2
Ali: Mesaj 3"""

        result = self.parser.parse(text, format_type="simple")

        self.assertEqual(result["stats"]["participant_count"], 1)
        self.assertEqual(result["stats"]["total_messages"], 3)


if __name__ == "__main__":
    unittest.main(verbosity=2)
