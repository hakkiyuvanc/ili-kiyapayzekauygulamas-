"""Test Script - Analiz Motorunu Test Et"""

from ml.analyzer import get_analyzer


def test_basic_analysis():
    """Basit analiz testi"""
    print("=" * 60)
    print("İLİŞKİ ANALİZ MOTORU TEST")
    print("=" * 60)
    print()

    # Test konuşması
    test_conversation = """
    Ahmet: Merhaba canım, bugün nasıl geçti?
    Ayşe: İyi geçti aşkım, teşekkür ederim. Sen nasılsın?
    Ahmet: Ben de iyiyim. Akşam birlikte yemek yiyelim mi?
    Ayşe: Harika fikir! Severim seni.
    Ahmet: Ben de seni çok seviyorum bebeğim.
    """

    # Analyzer instance
    analyzer = get_analyzer()

    print("📝 Test konuşması analiz ediliyor...\n")

    # Analiz yap
    report = analyzer.analyze_text(test_conversation, format_type="simple")

    if report.get("status") == "success":
        print("✅ Analiz başarılı!\n")

        print(f"📊 GENEL SKOR: {report['overall_score']:.1f}/100")
        print()

        print("📈 METRİKLER:")
        print("-" * 60)
        for metric_name, metric_data in report["metrics"].items():
            if isinstance(metric_data, dict) and "score" in metric_data:
                score = metric_data.get("score", 0)
                label = metric_data.get("label", "")
                print(f"  {metric_name:20s}: {score:5.1f}/100 - {label}")
        print()

        print("💡 ÖZET:")
        print("-" * 60)
        print(f"  {report['summary']}")
        print()

        print(f"✨ İÇGÖRÜLER ({len(report['insights'])} adet):")
        print("-" * 60)
        for insight in report["insights"]:
            print(f"  {insight['icon']} {insight['title']}")
            print(f"     {insight['description']}")
            print()

        print(f"🎯 ÖNERİLER ({len(report['recommendations'])} adet):")
        print("-" * 60)
        for i, rec in enumerate(report["recommendations"][:3], 1):  # İlk 3'ü göster
            print(f"  {i}. {rec['title']} [{rec['priority'].upper()}]")
            print(f"     {rec['description']}")
            print()

        # Metin raporu oluştur
        from ml.features.report_generator import ReportGenerator

        generator = ReportGenerator()
        text_report = generator.export_to_text(report)

        # Dosyaya kaydet
        with open("test_report.txt", "w", encoding="utf-8") as f:
            f.write(text_report)

        print("💾 Detaylı rapor 'test_report.txt' dosyasına kaydedildi")

    else:
        print(f"❌ Analiz başarısız: {report.get('error')}")

    print()
    print("=" * 60)


if __name__ == "__main__":
    test_basic_analysis()
