"""Analiz Rapor Oluşturucu"""

from typing import Dict, List, Optional
from datetime import datetime
import json
import os


class ReportGenerator:
    """İlişki analizi raporu oluştur"""

    def __init__(self):
        self.version = "1.0.0"
        self.ai_enabled = os.getenv("AI_ENABLED", "true").lower() == "true"
        self._ai_service = None

    def generate_summary(self, metrics: Dict[str, any]) -> str:
        """Özet metin oluştur"""
        sentiment = metrics.get("sentiment", {})
        empathy = metrics.get("empathy", {})
        conflict = metrics.get("conflict", {})
        we_language = metrics.get("we_language", {})
        balance = metrics.get("communication_balance", {})

        summary_parts = []

        # Genel ton
        if sentiment.get("score", 50) >= 60:
            summary_parts.append("İletişiminiz genel olarak pozitif bir ton taşıyor.")
        elif sentiment.get("score", 50) <= 40:
            summary_parts.append("İletişiminizde negatif bir ton gözlemleniyor.")
        else:
            summary_parts.append("İletişiminiz nötr bir ton taşıyor.")

        # Empati
        empathy_score = empathy.get("score", 0)
        if empathy_score >= 50:
            summary_parts.append("Empatik iletişim örnekleri mevcut.")
        else:
            summary_parts.append("Empati ifadeleri artırılabilir.")

        # Çatışma
        conflict_score = conflict.get("score", 0)
        if conflict_score >= 50:
            summary_parts.append("Çatışma göstergeleri yüksek seviyede.")
        elif conflict_score >= 30:
            summary_parts.append("Orta düzeyde çatışma belirtileri var.")
        else:
            summary_parts.append("Çatışma seviyeleri düşük.")

        # Biz-dili
        we_score = we_language.get("score", 50)
        if we_score >= 60:
            summary_parts.append("'Biz' dilini kullanımınız güçlü.")
        elif we_score <= 40:
            summary_parts.append("'Ben' ve 'Sen' dili ağırlıkta.")

        # Denge
        balance_score = balance.get("score", 0)
        if balance_score >= 70:
            summary_parts.append("İletişim dengesi mükemmel.")
        elif balance_score <= 40:
            summary_parts.append("İletişim dengesi iyileştirilebilir.")

        return " ".join(summary_parts)

    def _get_ai_service(self):
        """Lazy load AI service"""
        if self._ai_service is None and self.ai_enabled:
            try:
                from backend.app.services.ai_service import get_ai_service
                self._ai_service = get_ai_service()
            except Exception as e:
                print(f"AI service yüklenemedi: {e}")
                self.ai_enabled = False
        return self._ai_service

    def generate_insights(self, metrics: Dict[str, any], conversation_summary: str = "") -> List[Dict[str, str]]:
        """İçgörüler ve gözlemler - AI destekli"""
        
        # AI varsa kullan
        if self.ai_enabled:
            ai_service = self._get_ai_service()
            if ai_service:
                try:
                    ai_insights = ai_service.generate_insights(metrics, conversation_summary)
                    if ai_insights and len(ai_insights) > 0:
                        return ai_insights
                except Exception as e:
                    print(f"AI insights hatası: {e}")
        
        # Fallback: Rule-based insights
        insights = []

        sentiment = metrics.get("sentiment", {})
        empathy = metrics.get("empathy", {})
        conflict = metrics.get("conflict", {})
        we_language = metrics.get("we_language", {})
        balance = metrics.get("communication_balance", {})

        # Sentiment insights
        if sentiment.get("score", 50) >= 70:
            insights.append({
                "category": "Güçlü Yön",
                "title": "Pozitif İletişim",
                "description": "İletişiminiz güçlü bir pozitif ton içeriyor. Bu, ilişkiniz için çok değerli bir temel.",
                "icon": "✅",
            })
        elif sentiment.get("score", 50) <= 30:
            insights.append({
                "category": "Dikkat Noktası",
                "title": "Negatif Ton",
                "description": "İletişimde negatif ifadeler ağır basıyor. Pozitif dil kullanımını artırmak faydalı olabilir.",
                "icon": "⚠️",
            })

        # Empathy insights
        if empathy.get("score", 0) >= 60:
            insights.append({
                "category": "Güçlü Yön",
                "title": "Yüksek Empati",
                "description": "Karşınızdakinin duygularını anlamaya çalıştığınız açıkça görülüyor.",
                "icon": "💝",
            })
        elif empathy.get("score", 0) <= 20:
            insights.append({
                "category": "Gelişim Alanı",
                "title": "Empati Eksikliği",
                "description": "'Anlıyorum', 'hissediyorum' gibi empati ifadeleri kullanımını artırabilirsiniz.",
                "icon": "💡",
            })

        # Conflict insights
        if conflict.get("score", 0) >= 60:
            insights.append({
                "category": "Dikkat Noktası",
                "title": "Yüksek Çatışma",
                "description": "Çatışma göstergeleri yüksek. 'Ama', 'hep', 'hiç' gibi mutlaklaştırıcı ifadelerden kaçınmaya çalışın.",
                "icon": "⚠️",
            })

        # We-language insights
        if we_language.get("score", 50) >= 65:
            insights.append({
                "category": "Güçlü Yön",
                "title": "Biz-dili Kullanımı",
                "description": "'Biz', 'birlikte' gibi kelimeler ilişkide ortaklık hissini güçlendiriyor.",
                "icon": "👥",
            })
        elif we_language.get("score", 50) <= 35:
            insights.append({
                "category": "Gelişim Alanı",
                "title": "Bireysel Dil",
                "description": "'Ben' ve 'Sen' dilinden 'Biz' diline geçiş ilişkinizi güçlendirebilir.",
                "icon": "💡",
            })

        # Balance insights
        if balance.get("score", 0) >= 75:
            insights.append({
                "category": "Güçlü Yön",
                "title": "Dengeli İletişim",
                "description": "Her iki taraf da konuşmaya eşit katkıda bulunuyor.",
                "icon": "⚖️",
            })
        elif balance.get("score", 0) <= 40:
            insights.append({
                "category": "Dikkat Noktası",
                "title": "Dengesiz İletişim",
                "description": "Bir taraf diğerinden çok daha fazla konuşuyor. Dinleme-konuşma dengesi önemli.",
                "icon": "⚠️",
            })

        return insights

    def generate_recommendations(self, metrics: Dict[str, any], insights: List[Dict] = None) -> List[Dict[str, str]]:
        """Kişiselleştirilmiş öneriler - AI destekli"""
        
        # AI varsa kullan
        if self.ai_enabled and insights:
            ai_service = self._get_ai_service()
            if ai_service:
                try:
                    ai_recommendations = ai_service.generate_recommendations(metrics, insights)
                    if ai_recommendations and len(ai_recommendations) > 0:
                        return ai_recommendations
                except Exception as e:
                    print(f"AI recommendations hatası: {e}")
        
        # Fallback: Rule-based recommendations
        recommendations = []

        sentiment = metrics.get("sentiment", {})
        empathy = metrics.get("empathy", {})
        conflict = metrics.get("conflict", {})
        we_language = metrics.get("we_language", {})
        balance = metrics.get("communication_balance", {})

        # Sentiment recommendations
        if sentiment.get("score", 50) <= 40:
            recommendations.append({
                "priority": "high",
                "title": "Pozitif Dil Pratiği",
                "description": "Günde en az 3 pozitif ifade kullanmaya çalışın: 'Teşekkür ederim', 'Senin için mutluyum', 'Bunu sevdim'",
                "exercise": "Her akşam günün en iyi 3 anını paylaşın.",
            })

        # Empathy recommendations
        if empathy.get("score", 0) <= 30:
            recommendations.append({
                "priority": "high",
                "title": "Aktif Dinleme Egzersizi",
                "description": "Karşınız konuşurken, sadece dinleyin ve 'Anlıyorum' diyerek doğrulayın.",
                "exercise": "5 dakikalık kesintisiz dinleme seansları yapın.",
            })

        # Conflict recommendations
        if conflict.get("score", 0) >= 50:
            recommendations.append({
                "priority": "high",
                "title": "Yumuşak Başlangıç Tekniği",
                "description": "'Sen hep...' yerine 'Ben ... hissediyorum' şeklinde başlayın.",
                "exercise": "Şikayetlerinizi 'Ben dili' ile ifade etmeyi deneyin.",
            })

        # We-language recommendations
        if we_language.get("score", 50) <= 40:
            recommendations.append({
                "priority": "medium",
                "title": "Biz-dili Geliştirme",
                "description": "Ortak hedeflerinizden ve paylaşılan deneyimlerinizden bahsedin.",
                "exercise": "Haftalık 'Biz' planları yapın: 'Bu hafta biz ne yapalım?'",
            })

        # Balance recommendations
        if balance.get("score", 0) <= 50:
            recommendations.append({
                "priority": "medium",
                "title": "Konuşma Dengesi",
                "description": "Az konuşan taraf için alan açın, çok konuşan taraf duraksamalar bırakın.",
                "exercise": "Her konuşmada karşınızın en az 3 cümle söylemesini bekleyin.",
            })

        # Genel öneri
        recommendations.append({
            "priority": "low",
            "title": "Günlük Check-in",
            "description": "Her gün 10 dakika kesintisiz konuşma zamanı ayırın.",
            "exercise": "Telefonlar kapalı, sadece ikiniz. Günü özetleyin ve paylaşın.",
        })

        return recommendations

    def generate_report(
        self,
        metrics: Dict[str, any],
        conversation_stats: Dict[str, any] = None,
        metadata: Dict[str, any] = None,
    ) -> Dict[str, any]:
        """Tam analiz raporu oluştur"""
        report = {
            "version": self.version,
            "generated_at": datetime.utcnow().isoformat(),
            "metadata": metadata or {},
            
            # Ana metrikler
            "metrics": {
                "sentiment": metrics.get("sentiment", {}),
                "empathy": metrics.get("empathy", {}),
                "conflict": metrics.get("conflict", {}),
                "we_language": metrics.get("we_language", {}),
                "communication_balance": metrics.get("communication_balance", {}),
            },
            
            # Genel skor (0-100)
            "overall_score": self._calculate_overall_score(metrics),
            
            # Özet
            "summary": self.generate_summary(metrics),
        }
        
        # İçgörüler (AI destekli)
        insights = self.generate_insights(metrics, report["summary"])
        report["insights"] = insights
        
        # Öneriler (AI destekli, insights kullanarak)
        report["recommendations"] = self.generate_recommendations(metrics, insights)
        
        # Konuşma istatistikleri
        report["conversation_stats"] = conversation_stats or {}
        
        # AI ile özet geliştirme (opsiyonel)
        if self.ai_enabled:
            ai_service = self._get_ai_service()
            if ai_service:
                try:
                    enhanced_summary = ai_service.enhance_summary(report["summary"], metrics)
                    if enhanced_summary:
                        report["summary_enhanced"] = enhanced_summary
                except Exception as e:
                    print(f"AI summary enhancement hatası: {e}")

        # Cevap önerileri (AI destekli)
        reply_suggestions = []
        if self.ai_enabled:
             ai_service = self._get_ai_service()
             if ai_service:
                 try:
                    reply_suggestions = ai_service.generate_reply_suggestions(metrics, report["summary"])
                 except Exception as e:
                     print(f"Cevap önerisi hatası: {e}")
        report["reply_suggestions"] = reply_suggestions
        
        return report

    def _calculate_overall_score(self, metrics: Dict[str, any]) -> float:
        """Genel ilişki sağlığı skoru (0-10)"""
        sentiment_score = metrics.get("sentiment", {}).get("score", 50)
        empathy_score = metrics.get("empathy", {}).get("score", 0)
        conflict_score = 100 - metrics.get("conflict", {}).get("score", 0)  # Ters çevir
        we_language_score = metrics.get("we_language", {}).get("score", 50)
        balance_score = metrics.get("communication_balance", {}).get("score", 0)

        # Ağırlıklı ortalama (0-100 arası)
        weights = {
            "sentiment": 0.30,
            "empathy": 0.25,
            "conflict": 0.20,
            "we_language": 0.15,
            "balance": 0.10,
        }

        overall_100 = (
            sentiment_score * weights["sentiment"]
            + empathy_score * weights["empathy"]
            + conflict_score * weights["conflict"]
            + we_language_score * weights["we_language"]
            + balance_score * weights["balance"]
        )

        # 0-10 ölçeğine dönüştür
        return round(overall_100 / 10, 2)

    def export_to_json(self, report: Dict[str, any], filepath: str):
        """Raporu JSON olarak kaydet"""
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(report, f, ensure_ascii=False, indent=2)

    def export_to_text(self, report: Dict[str, any]) -> str:
        """Raporu okunabilir metin formatında dışa aktar"""
        lines = []
        lines.append("=" * 60)
        lines.append("İLİŞKİ ANALİZ RAPORU")
        lines.append("=" * 60)
        lines.append("")
        
        lines.append(f"Tarih: {report['generated_at']}")
        lines.append(f"Genel Skor: {report['overall_score']:.1f}/10")
        lines.append("")
        
        lines.append("ÖZET")
        lines.append("-" * 60)
        lines.append(report['summary'])
        lines.append("")
        
        lines.append("METRİKLER")
        lines.append("-" * 60)
        for metric_name, metric_data in report['metrics'].items():
            if isinstance(metric_data, dict) and 'score' in metric_data:
                label = metric_data.get('label', '')
                score = metric_data.get('score', 0)
                lines.append(f"{metric_name.upper()}: {score:.1f}/100 - {label}")
        lines.append("")
        
        lines.append("İÇGÖRÜLER")
        lines.append("-" * 60)
        for insight in report['insights']:
            lines.append(f"{insight['icon']} {insight['title']}")
            lines.append(f"   {insight['description']}")
            lines.append("")
        
        lines.append("ÖNERİLER")
        lines.append("-" * 60)
        for i, rec in enumerate(report['recommendations'], 1):
            lines.append(f"{i}. {rec['title']} [Öncelik: {rec['priority'].upper()}]")
            lines.append(f"   {rec['description']}")
            lines.append(f"   Egzersiz: {rec['exercise']}")
            lines.append("")
        
        lines.append("=" * 60)
        
        return "\n".join(lines)
