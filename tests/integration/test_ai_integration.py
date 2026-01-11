#!/usr/bin/env python3
"""AI Integration Test Script"""

import json
import os
import sys

# Backend path ekle
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend"))

from backend.app.services.ai_service import get_ai_service
from ml.features.report_generator import ReportGenerator


def test_ai_integration():
    """AI servisini test et"""

    print("=" * 60)
    print("AI ENTEGRASYON TESTİ")
    print("=" * 60)

    # Konfigürasyon kontrolü
    print("\n1. Konfigürasyon:")
    print(f"   AI_ENABLED: {os.getenv('AI_ENABLED', 'false')}")
    print(f"   AI_PROVIDER: {os.getenv('AI_PROVIDER', 'none')}")

    api_key = os.getenv("OPENAI_API_KEY", "")
    if api_key:
        print(f"   OPENAI_API_KEY: sk-...{api_key[-4:]}")
    else:
        print("   OPENAI_API_KEY: (yok)")

    # Test metrikleri
    metrics = {
        "sentiment": {"score": 62.5, "positive_words": 5, "negative_words": 3, "label": "Olumlu"},
        "empathy": {"score": 100, "count": 4, "label": "Yüksek"},
        "conflict": {"score": 0.0, "indicators": 0, "label": "Çok Düşük"},
        "we_language": {"score": 20.0, "we_words": 1, "i_you_words": 4, "label": "Zayıf Biz-dili"},
        "communication_balance": {"score": 62.28, "label": "İyi Denge"},
    }

    conversation_summary = "İletişiminiz genel olarak pozitif bir ton taşıyor. Empatik iletişim örnekleri mevcut. Çatışma seviyeleri düşük. 'Ben' ve 'Sen' dili ağırlıkta."

    # AI Servisi testi
    print("\n2. AI Servisi Testi:")
    ai_service = get_ai_service()

    if ai_service._is_available():
        print("   ✅ AI servisi kullanılabilir")
        print(f"   Provider: {ai_service.provider}")
    else:
        print("   ⚠️  AI servisi kullanılamıyor (fallback mode)")

    # İçgörüler oluştur
    print("\n3. İçgörüler (Insights):")
    print("   Oluşturuluyor...")

    try:
        insights = ai_service.generate_insights(metrics, conversation_summary)

        if insights:
            print(f"   ✅ {len(insights)} içgörü oluşturuldu")
            for i, insight in enumerate(insights, 1):
                print(f"\n   [{i}] {insight.get('category', 'N/A')}: {insight.get('title', 'N/A')}")
                print(f"       {insight.get('description', 'N/A')}")
        else:
            print("   ⚠️  İçgörü oluşturulamadı")
    except Exception as e:
        print(f"   ❌ Hata: {e}")
        insights = []

    # Öneriler oluştur
    print("\n4. Öneriler (Recommendations):")
    print("   Oluşturuluyor...")

    try:
        recommendations = ai_service.generate_recommendations(metrics, insights)

        if recommendations:
            print(f"   ✅ {len(recommendations)} öneri oluşturuldu")
            for i, rec in enumerate(recommendations, 1):
                print(f"\n   [{i}] {rec.get('category', 'N/A')}: {rec.get('title', 'N/A')}")
                print(f"       {rec.get('description', 'N/A')}")
        else:
            print("   ⚠️  Öneri oluşturulamadı")
    except Exception as e:
        print(f"   ❌ Hata: {e}")
        recommendations = []

    # Özet geliştirme
    print("\n5. Özet Geliştirme:")
    print("   Oluşturuluyor...")

    try:
        enhanced_summary = ai_service.enhance_summary(conversation_summary, metrics)

        if enhanced_summary and enhanced_summary != conversation_summary:
            print("   ✅ Özet geliştirildi")
            print(f"\n   Orijinal: {conversation_summary}")
            print(f"\n   Geliştirilmiş: {enhanced_summary}")
        else:
            print("   ⚠️  Özet geliştirilemedi (fallback kullanıldı)")
    except Exception as e:
        print(f"   ❌ Hata: {e}")

    # ReportGenerator entegrasyonu
    print("\n6. ReportGenerator Entegrasyonu:")
    report_gen = ReportGenerator()

    report = report_gen.generate_report(
        metrics=metrics,
        conversation_stats={"total_messages": 5, "participant_count": 2},
        metadata={"text_length": 150, "format": "simple"},
    )

    print("   ✅ Rapor oluşturuldu")
    print(f"   Overall Score: {report.get('overall_score', 0)}/10")
    print(f"   İçgörü sayısı: {len(report.get('insights', []))}")
    print(f"   Öneri sayısı: {len(report.get('recommendations', []))}")

    if report.get("summary_enhanced"):
        print("   ✅ AI-enhanced özet var")
    else:
        print("   ⚠️  AI-enhanced özet yok (fallback kullanıldı)")

    # JSON export
    output_file = "test_ai_report.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)

    print(f"\n7. Rapor kaydedildi: {output_file}")

    print("\n" + "=" * 60)
    print("TEST TAMAMLANDI")
    print("=" * 60)


if __name__ == "__main__":
    test_ai_integration()
