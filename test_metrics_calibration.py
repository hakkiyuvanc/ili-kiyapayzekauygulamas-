"""Test Updated Metrics"""

import sys
sys.path.insert(0, '/Users/hakkiyuvanc/GİTHUB/ilişki yapay zeka/ili-kiyapayzekauygulamas-')

from ml.analyzer import get_analyzer

# Test 1: Pozitif, sevgi dolu konuşma
print("=" * 60)
print("TEST 1: Pozitif Konuşma (Beklenen: Yüksek skor)")
print("=" * 60)

positive_text = """Ahmet: Merhaba canım, bugün nasıl geçti?
Ayşe: İyi geçti aşkım, teşekkür ederim. Sen nasılsın?
Ahmet: Ben de iyiyim. Akşam birlikte yemek yiyelim mi?
Ayşe: Harika fikir! Severim seni ❤️
Ahmet: Ben de seni çok seviyorum bebeğim 💕"""

analyzer = get_analyzer()
result1 = analyzer.analyze_text(positive_text, format_type="simple")

print(f"\nGenel Skor: {result1['overall_score']}/10")
print("\nMetrikler:")
print(f"  Sentiment: {result1['metrics']['sentiment']['score']:.1f} - {result1['metrics']['sentiment']['label']}")
print(f"  Empathy: {result1['metrics']['empathy']['score']:.1f} - {result1['metrics']['empathy']['label']}")
print(f"    - Kelimeler: {result1['metrics']['empathy']['count']}")
print(f"    - Emojiler: {result1['metrics']['empathy']['emoji_count']}")
print(f"  Conflict: {result1['metrics']['conflict']['score']:.1f} - {result1['metrics']['conflict']['label']}")
print(f"  We-language: {result1['metrics']['we_language']['score']:.1f} - {result1['metrics']['we_language']['label']}")
print(f"  Balance: {result1['metrics']['communication_balance']['score']:.1f} - {result1['metrics']['communication_balance']['label']}")

# Test 2: Çatışmalı konuşma
print("\n" + "=" * 60)
print("TEST 2: Çatışmalı Konuşma (Beklenen: Düşük skor)")
print("=" * 60)

conflict_text = """Ali: NEDEN HEP BÖYLE YAPIYORSUN!!!
Ayşe: SEN DE HEP AYNI ŞEYLERI SÖYLÜYORSUN!!!
Ali: BU KABUL EDİLEMEZ! SEN HİÇ DEĞİŞMİYORSUN!
Ayşe: SEN ASLA ANLAMIYORSUN! HATA HEP SENİN!
Ali: BIKTIM ARTIK! HEP AYNI ŞEY!"""

result2 = analyzer.analyze_text(conflict_text, format_type="simple")

print(f"\nGenel Skor: {result2['overall_score']}/10")
print("\nMetrikler:")
print(f"  Sentiment: {result2['metrics']['sentiment']['score']:.1f} - {result2['metrics']['sentiment']['label']}")
print(f"  Empathy: {result2['metrics']['empathy']['score']:.1f} - {result2['metrics']['empathy']['label']}")
print(f"  Conflict: {result2['metrics']['conflict']['score']:.1f} - {result2['metrics']['conflict']['label']}")
print(f"    - İndikatörler: {result2['metrics']['conflict']['indicators']}")
print(f"    - Büyük harf: {result2['metrics']['conflict']['capital_ratio']:.1f}%")
print(f"    - Ünlemler: {result2['metrics']['conflict']['exclamation_count']}")
print(f"  We-language: {result2['metrics']['we_language']['score']:.1f} - {result2['metrics']['we_language']['label']}")
print(f"  Balance: {result2['metrics']['communication_balance']['score']:.1f} - {result2['metrics']['communication_balance']['label']}")

# Test 3: Dengeli, empatik konuşma
print("\n" + "=" * 60)
print("TEST 3: Dengeli Konuşma (Beklenen: Orta-yüksek skor)")
print("=" * 60)

balanced_text = """Mehmet: Bugün işte zor bir gün geçirdim
Zeynep: Anlıyorum, seni dinliyorum. Ne oldu?
Mehmet: Proje teslimi vardı, çok stresliydim
Zeynep: Haklısın, stresli olman doğal. Nasıl hissediyorsun şimdi?
Mehmet: Seninle konuşmak iyi geldi, teşekkür ederim
Zeynep: Ben de seninle olmaktan mutluyum. Birlikte hallederiz"""

result3 = analyzer.analyze_text(balanced_text, format_type="simple")

print(f"\nGenel Skor: {result3['overall_score']}/10")
print("\nMetrikler:")
print(f"  Sentiment: {result3['metrics']['sentiment']['score']:.1f} - {result3['metrics']['sentiment']['label']}")
print(f"  Empathy: {result3['metrics']['empathy']['score']:.1f} - {result3['metrics']['empathy']['label']}")
print(f"  Conflict: {result3['metrics']['conflict']['score']:.1f} - {result3['metrics']['conflict']['label']}")
print(f"  We-language: {result3['metrics']['we_language']['score']:.1f} - {result3['metrics']['we_language']['label']}")
print(f"  Balance: {result3['metrics']['communication_balance']['score']:.1f} - {result3['metrics']['communication_balance']['label']}")

# Karşılaştırma özeti
print("\n" + "=" * 60)
print("KARŞILAŞTIRMA ÖZETİ")
print("=" * 60)
print(f"Pozitif Konuşma Skoru: {result1['overall_score']}/10")
print(f"Çatışmalı Konuşma Skoru: {result2['overall_score']}/10")
print(f"Dengeli Konuşma Skoru: {result3['overall_score']}/10")
print("\n✅ Test tamamlandı!")
