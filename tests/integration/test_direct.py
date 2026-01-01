"""API Test Script - Server olmadan direkt test"""

import sys
sys.path.insert(0, '.')

from ml.analyzer import get_analyzer


def test_analyzer():
    """Analyzer'ı direkt test et"""
    
    print("=" * 70)
    print("İLİŞKİ ANALİZ MOTORUtesT")
    print("=" * 70)
    print()
    
    # Test konuşması
    test_text = """
    Ahmet: Merhaba canım, bugün nasıl geçti?
    Ayşe: İyi geçti aşkım, teşekkür ederim. Sen nasılsın?
    Ahmet: Ben de iyiyim. Akşam birlikte yemek yiyelim mi?
    Ayşe: Harika fikir! Severim seni.
    Ahmet: Ben de seni çok seviyorum bebeğim.
    """
    
    print("📝 Test konuşması:")
    print("-" * 70)
    print(test_text.strip())
    print()
    
    # Analyzer
    analyzer = get_analyzer()
    print(f"🔧 Preprocessor tipi: {'spaCy' if analyzer.use_spacy else 'Simple'}")
    print()
    
    # Analiz
    print("⚙️  Analiz yapılıyor...")
    result = analyzer.analyze_text(test_text, format_type="simple", privacy_mode=True)
    
    if result.get("status") == "success":
        print("✅ Analiz başarılı!")
        print()
        
        print(f"📊 GENEL SKOR: {result['overall_score']:.1f}/100")
        print()
        
        print("📈 METRİKLER:")
        print("-" * 70)
        metrics = result.get('metrics', {})
        for name, data in metrics.items():
            if isinstance(data, dict) and 'score' in data:
                score = data.get('score', 0)
                label = data.get('label', '')
                print(f"  {name:25s}: {score:6.1f}/100  [{label}]")
        print()
        
        print("💡 ÖZET:")
        print("-" * 70)
        print(f"  {result.get('summary', '')}")
        print()
        
        insights = result.get('insights', [])
        print(f"✨ İÇGÖRÜLER ({len(insights)} adet):")
        print("-" * 70)
        for insight in insights[:3]:
            print(f"  {insight.get('icon', '')} {insight.get('title', '')}")
            print(f"     {insight.get('description', '')}")
            print()
        
        recs = result.get('recommendations', [])
        print(f"🎯 ÖNERİLER ({len(recs)} adet):")
        print("-" * 70)
        for i, rec in enumerate(recs[:3], 1):
            print(f"  {i}. {rec.get('title', '')} [{rec.get('priority', '').upper()}]")
            print(f"     {rec.get('description', '')}")
            print()
        
        print("=" * 70)
        print("✅ Test başarıyla tamamlandı!")
        
    else:
        print(f"❌ Hata: {result.get('error', 'Bilinmeyen hata')}")
    
    print()


if __name__ == "__main__":
    test_analyzer()
