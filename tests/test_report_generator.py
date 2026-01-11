"""Unit Tests for Report Generator"""

import sys
import unittest

sys.path.insert(0, "/Users/hakkiyuvanc/GİTHUB/ilişki yapay zeka/ili-kiyapayzekauygulamas-")

from ml.features.report_generator import ReportGenerator


class TestReportGenerator(unittest.TestCase):
    """Test cases for ReportGenerator"""

    def setUp(self):
        """Set up test fixtures"""
        self.generator = ReportGenerator()
        self.sample_metrics = {
            "sentiment": {"score": 70.0, "label": "Çok Olumlu"},
            "empathy": {"score": 60.0, "label": "Orta"},
            "conflict": {"score": 20.0, "label": "Düşük"},
            "we_language": {"score": 50.0, "label": "Dengeli"},
            "communication_balance": {"score": 80.0, "label": "Mükemmel Denge"},
        }

    def test_generate_summary(self):
        """Test summary generation"""
        summary = self.generator.generate_summary(self.sample_metrics)

        self.assertIsInstance(summary, str)
        self.assertGreater(len(summary), 0)
        self.assertIn("pozitif", summary.lower())

    def test_generate_insights(self):
        """Test insights generation"""
        insights = self.generator.generate_insights(self.sample_metrics)

        self.assertIsInstance(insights, list)
        self.assertGreater(len(insights), 0)

        # Check insight structure
        for insight in insights:
            self.assertIn("category", insight)
            self.assertIn("title", insight)
            self.assertIn("description", insight)
            self.assertIn("icon", insight)

    def test_generate_recommendations(self):
        """Test recommendations generation"""
        recommendations = self.generator.generate_recommendations(self.sample_metrics)

        self.assertIsInstance(recommendations, list)
        self.assertGreater(len(recommendations), 0)

        # Check recommendation structure
        for rec in recommendations:
            self.assertIn("priority", rec)
            self.assertIn("title", rec)
            self.assertIn("description", rec)
            self.assertIn("exercise", rec)

    def test_calculate_overall_score_range(self):
        """Test overall score is in 0-10 range"""
        score = self.generator._calculate_overall_score(self.sample_metrics)

        self.assertGreaterEqual(score, 0)
        self.assertLessEqual(score, 10)

    def test_calculate_overall_score_high(self):
        """Test high overall score with good metrics"""
        high_metrics = {
            "sentiment": {"score": 90.0},
            "empathy": {"score": 80.0},
            "conflict": {"score": 10.0},
            "we_language": {"score": 70.0},
            "communication_balance": {"score": 90.0},
        }
        score = self.generator._calculate_overall_score(high_metrics)

        self.assertGreater(score, 7.0)

    def test_calculate_overall_score_low(self):
        """Test low overall score with bad metrics"""
        low_metrics = {
            "sentiment": {"score": 20.0},
            "empathy": {"score": 10.0},
            "conflict": {"score": 80.0},
            "we_language": {"score": 20.0},
            "communication_balance": {"score": 30.0},
        }
        score = self.generator._calculate_overall_score(low_metrics)

        self.assertLess(score, 4.0)

    def test_generate_report_structure(self):
        """Test complete report structure"""
        report = self.generator.generate_report(self.sample_metrics)

        # Check required keys
        self.assertIn("version", report)
        self.assertIn("generated_at", report)
        self.assertIn("metrics", report)
        self.assertIn("overall_score", report)
        self.assertIn("summary", report)
        self.assertIn("insights", report)
        self.assertIn("recommendations", report)

        # Check overall score format
        self.assertIsInstance(report["overall_score"], float)
        self.assertGreaterEqual(report["overall_score"], 0)
        self.assertLessEqual(report["overall_score"], 10)

    def test_export_to_text(self):
        """Test text export format"""
        report = self.generator.generate_report(self.sample_metrics)
        text = self.generator.export_to_text(report)

        self.assertIsInstance(text, str)
        self.assertIn("İLİŞKİ ANALİZ RAPORU", text)
        self.assertIn("Genel Skor", text)
        self.assertIn("/10", text)  # Should be 0-10 scale
        self.assertIn("METRİKLER", text)
        self.assertIn("İÇGÖRÜLER", text)
        self.assertIn("ÖNERİLER", text)


if __name__ == "__main__":
    unittest.main(verbosity=2)
