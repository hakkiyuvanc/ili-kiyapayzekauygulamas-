"""Unit Tests for Relationship Metrics"""

import unittest
import sys
sys.path.insert(0, '/Users/hakkiyuvanc/GİTHUB/ilişki yapay zeka/ili-kiyapayzekauygulamas-')

from ml.features.relationship_metrics import RelationshipMetrics


class TestRelationshipMetrics(unittest.TestCase):
    """Test cases for RelationshipMetrics"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.metrics = RelationshipMetrics()
    
    def test_sentiment_positive(self):
        """Test positive sentiment detection"""
        text = "Seni seviyorum canım, çok mutluyum"
        result = self.metrics.calculate_sentiment_score(text)
        
        self.assertGreater(result['score'], 70)
        self.assertEqual(result['label'], 'Çok Olumlu')
        self.assertGreater(result['positive_words'], 0)
    
    def test_sentiment_negative(self):
        """Test negative sentiment detection"""
        text = "Bıktım artık, çok kötü, nefret ediyorum"
        result = self.metrics.calculate_sentiment_score(text)
        
        self.assertLess(result['score'], 30)
        self.assertEqual(result['label'], 'Çok Olumsuz')
        self.assertGreater(result['negative_words'], 0)
    
    def test_sentiment_neutral(self):
        """Test neutral sentiment"""
        text = "Merhaba nasılsın bugün"
        result = self.metrics.calculate_sentiment_score(text)
        
        self.assertGreaterEqual(result['score'], 45)
        self.assertLessEqual(result['score'], 55)
    
    def test_empathy_with_indicators(self):
        """Test empathy detection with Turkish words"""
        text = "Anlıyorum canım, seni dinliyorum, hissediyorum"
        result = self.metrics.calculate_empathy_score(text)
        
        self.assertGreater(result['score'], 50)
        self.assertGreater(result['count'], 0)
    
    def test_empathy_with_emojis(self):
        """Test empathy detection with emojis"""
        text = "Seviyorum seni ❤️💕"
        result = self.metrics.calculate_empathy_score(text)
        
        self.assertGreater(result['score'], 30)
        self.assertEqual(result['emoji_count'], 2)
    
    def test_empathy_none(self):
        """Test no empathy detection"""
        text = "Hava bugün güzel gibi duruyor"
        result = self.metrics.calculate_empathy_score(text)
        
        self.assertLessEqual(result['score'], 10)
    
    def test_conflict_low(self):
        """Test low conflict detection"""
        text = "İyi günler, nasılsınız"
        result = self.metrics.calculate_conflict_score(text)
        
        self.assertLess(result['score'], 20)
        self.assertEqual(result['label'], 'Çok Düşük')
    
    def test_conflict_high_indicators(self):
        """Test high conflict with indicators"""
        text = "Ama sen hep böylesin, asla değişmiyorsun, yeter artık"
        result = self.metrics.calculate_conflict_score(text)
        
        self.assertGreater(result['score'], 30)
        self.assertGreater(result['indicators'], 0)
    
    def test_conflict_high_capitals(self):
        """Test high conflict with capital letters"""
        text = "NEDEN HEP BÖYLE YAPIYORSUN"
        result = self.metrics.calculate_conflict_score(text)
        
        self.assertGreater(result['score'], 40)
        self.assertGreater(result['capital_ratio'], 40)
    
    def test_conflict_exclamation(self):
        """Test conflict with exclamations"""
        text = "Bu kabul edilemez!! Yeter artık!!"
        result = self.metrics.calculate_conflict_score(text)
        
        self.assertGreater(result['score'], 30)
        self.assertGreater(result['exclamation_count'], 2)
    
    def test_we_language_high(self):
        """Test strong we-language usage"""
        text = "Birlikte yapabiliriz, biz başarırız, bizim için"
        result = self.metrics.calculate_we_language_score(text)
        
        self.assertGreater(result['score'], 60)
        self.assertGreater(result['we_words'], 0)
    
    def test_we_language_low(self):
        """Test weak we-language usage"""
        text = "Ben düşünüyorum, sen yapıyorsun, benim için"
        result = self.metrics.calculate_we_language_score(text)
        
        self.assertLess(result['score'], 40)
        self.assertGreater(result['i_you_words'], 0)
    
    def test_communication_balance_equal(self):
        """Test balanced communication"""
        messages = {
            "Ali": [
                {"content": "Merhaba nasılsın"},
                {"content": "İyi günler"},
            ],
            "Ayşe": [
                {"content": "İyiyim teşekkürler"},
                {"content": "Sen nasılsın"},
            ]
        }
        result = self.metrics.calculate_communication_balance(messages)
        
        self.assertGreater(result['score'], 70)
        self.assertEqual(result['label'], 'Mükemmel Denge')
    
    def test_communication_balance_unequal(self):
        """Test unbalanced communication"""
        messages = {
            "Ali": [
                {"content": "Mesaj 1"},
                {"content": "Mesaj 2"},
                {"content": "Mesaj 3"},
                {"content": "Mesaj 4"},
            ],
            "Ayşe": [
                {"content": "Tamam"},
            ]
        }
        result = self.metrics.calculate_communication_balance(messages)
        
        self.assertLess(result['score'], 60)
    
    def test_communication_balance_single_participant(self):
        """Test single participant (monologue)"""
        messages = {
            "Ali": [
                {"content": "Mesaj 1"},
                {"content": "Mesaj 2"},
            ]
        }
        result = self.metrics.calculate_communication_balance(messages)
        
        self.assertEqual(result['score'], 0.0)
        self.assertEqual(result['label'], 'Tek Taraflı')


class TestMetricLabels(unittest.TestCase):
    """Test metric label functions"""
    
    def setUp(self):
        self.metrics = RelationshipMetrics()
    
    def test_sentiment_labels(self):
        """Test all sentiment label ranges"""
        self.assertEqual(self.metrics._sentiment_label(80), 'Çok Olumlu')
        self.assertEqual(self.metrics._sentiment_label(60), 'Olumlu')
        self.assertEqual(self.metrics._sentiment_label(50), 'Nötr')
        self.assertEqual(self.metrics._sentiment_label(35), 'Olumsuz')
        self.assertEqual(self.metrics._sentiment_label(20), 'Çok Olumsuz')
    
    def test_empathy_labels(self):
        """Test all empathy label ranges"""
        self.assertEqual(self.metrics._empathy_label(80), 'Yüksek')
        self.assertEqual(self.metrics._empathy_label(50), 'Orta')
        self.assertEqual(self.metrics._empathy_label(20), 'Düşük')
        self.assertEqual(self.metrics._empathy_label(5), 'Çok Düşük')
    
    def test_conflict_labels(self):
        """Test all conflict label ranges"""
        self.assertEqual(self.metrics._conflict_label(80), 'Çok Yüksek')
        self.assertEqual(self.metrics._conflict_label(60), 'Yüksek')
        self.assertEqual(self.metrics._conflict_label(40), 'Orta')
        self.assertEqual(self.metrics._conflict_label(15), 'Düşük')
        self.assertEqual(self.metrics._conflict_label(5), 'Çok Düşük')


if __name__ == '__main__':
    # Run tests with verbose output
    unittest.main(verbosity=2)
