#!/bin/bash

# 🧪 Hızlı Test Scripti
# Kullanım: ./QUICK_TEST.sh [senaryo_numarası]

echo "🎯 İLİŞKİ ANALİZİ - HIZLI TEST"
echo "=============================="
echo ""

# Backend kontrolü
check_backend() {
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        echo "✅ Backend çalışıyor"
        return 0
    else
        echo "❌ Backend çalışmıyor - Başlatılıyor..."
        cd "/Users/hakkiyuvanc/GİTHUB/ilişki yapay zeka/ili-kiyapayzekauygulamas-"
        source venv/bin/activate
        nohup python -m backend.app.main > /dev/null 2>&1 &
        sleep 3
        echo "✅ Backend başlatıldı"
        return 1
    fi
}

# Test senaryoları
test_positive() {
    echo ""
    echo "📊 TEST 1: Pozitif İlişki Analizi"
    echo "================================"
    RESULT=$(curl -s -X POST http://localhost:8000/api/analysis/analyze \
      -H "Content-Type: application/json" \
      -d '{
        "text": "Deniz: Günaydın aşkım! Kahvaltı hazırladım sana ☕\nSelin: Çok tatlısın! Teşekkür ederim canım 💕\nDeniz: Bugün işten sonra yürüyüşe çıkalım mı?\nSelin: Harika fikir! Deniz kenarına gidelim istersen\nDeniz: Mükemmel! Saat 6'\''da hazır ol 😊\nSelin: Tamam aşkım, görüşürüz! Seni seviyorum ❤️"
      }')
    
    echo "$RESULT" | python -c "
import sys, json
try:
    d = json.load(sys.stdin)
    print('✅ Durum:', d['status'])
    print('🎯 Genel Skor:', d['overall_score'], '/10')
    print('💚 Duygu:', d['metrics']['sentiment']['score'], '% -', d['metrics']['sentiment']['label'])
    print('🫂 Empati:', d['metrics']['empathy']['score'], '% -', d['metrics']['empathy']['label'])
    print('⚖️  Denge:', d['metrics']['communication_balance']['score'], '% -', d['metrics']['communication_balance']['label'])
    print('⚠️  Çatışma:', d['metrics']['conflict']['score'], '% -', d['metrics']['conflict']['label'])
except Exception as e:
    print('❌ Hata:', e)
    print(sys.stdin.read())
"
}

test_conflict() {
    echo ""
    echo "⚠️  TEST 2: Çatışmalı İlişki Analizi"
    echo "=================================="
    RESULT=$(curl -s -X POST http://localhost:8000/api/analysis/analyze \
      -H "Content-Type: application/json" \
      -d '{
        "text": "Ahmet: Neden hiç aramadın?\nZeynep: Çok yoğundum, anlayışlı ol lütfen\nAhmet: Her zaman bahane buluyorsun\nZeynep: Bahane değil, gerçekten çok işim vardı!\nAhmet: Sen hiç beni düşünmüyorsun\nZeynep: Haksızlık ediyorsun, bunu nasıl söylersin?"
      }')
    
    echo "$RESULT" | python -c "
import sys, json
try:
    d = json.load(sys.stdin)
    print('✅ Durum:', d['status'])
    print('🎯 Genel Skor:', d['overall_score'], '/10')
    print('💚 Duygu:', d['metrics']['sentiment']['score'], '% -', d['metrics']['sentiment']['label'])
    print('🫂 Empati:', d['metrics']['empathy']['score'], '% -', d['metrics']['empathy']['label'])
    print('⚖️  Denge:', d['metrics']['communication_balance']['score'], '% -', d['metrics']['communication_balance']['label'])
    print('⚠️  Çatışma:', d['metrics']['conflict']['score'], '% -', d['metrics']['conflict']['label'])
except Exception as e:
    print('❌ Hata:', e)
"
}

test_imbalanced() {
    echo ""
    echo "⚖️  TEST 3: Dengesiz İletişim Analizi"
    echo "===================================="
    RESULT=$(curl -s -X POST http://localhost:8000/api/analysis/analyze \
      -H "Content-Type: application/json" \
      -d '{
        "text": "Can: Bugün çok güzel bir gün geçirdim! Sabah koşuya gittim, sonra kahvaltı yaptım.\nEce: İyiymiş\nCan: Film çok güzeldi! Senin de izlemen lazım. Yeni restoran keşfettim.\nEce: Olur\nCan: Harika! Cumartesi uygun mu?\nEce: Tamam"
      }')
    
    echo "$RESULT" | python -c "
import sys, json
try:
    d = json.load(sys.stdin)
    print('✅ Durum:', d['status'])
    print('🎯 Genel Skor:', d['overall_score'], '/10')
    print('💚 Duygu:', d['metrics']['sentiment']['score'], '% -', d['metrics']['sentiment']['label'])
    print('⚖️  Denge:', d['metrics']['communication_balance']['score'], '% -', d['metrics']['communication_balance']['label'])
    print('📊 Can:', d['metrics']['communication_balance']['distribution']['Can']['message_percentage'], '% mesaj')
    print('📊 Ece:', d['metrics']['communication_balance']['distribution']['Ece']['message_percentage'], '% mesaj')
except Exception as e:
    print('❌ Hata:', e)
"
}

test_whatsapp() {
    echo ""
    echo "📱 TEST 4: WhatsApp Format Testi"
    echo "================================"
    RESULT=$(curl -s -X POST http://localhost:8000/api/analysis/analyze \
      -H "Content-Type: application/json" \
      -d '{
        "text": "01.01.2024, 10:30 - Ali: Merhaba canım! Nasılsın?\n01.01.2024, 10:31 - Ayşe: İyiyim aşkım, sen nasılsın?\n01.01.2024, 10:32 - Ali: Çok iyiyim! 😊\n01.01.2024, 10:33 - Ayşe: Harika! Bugün buluşalım mı? 💕"
      }')
    
    echo "$RESULT" | python -c "
import sys, json
try:
    d = json.load(sys.stdin)
    print('✅ WhatsApp formatı başarıyla parse edildi!')
    print('🎯 Genel Skor:', d['overall_score'], '/10')
    print('💚 Duygu:', d['metrics']['sentiment']['label'])
    print('👥 Konuşan:', ', '.join(d['metrics']['communication_balance']['distribution'].keys()))
except Exception as e:
    print('❌ Hata:', e)
"
}

test_performance() {
    echo ""
    echo "⚡ TEST 5: Performans Testi (10 request)"
    echo "======================================"
    START=$(date +%s)
    echo "Başlangıç: $(date +%H:%M:%S)"
    
    for i in {1..10}; do
        curl -s -X POST http://localhost:8000/api/analysis/analyze \
          -H "Content-Type: application/json" \
          -d '{"text": "Ali: Test mesajı\nAyşe: Tamam"}' > /dev/null
        echo -n "."
    done
    
    END=$(date +%s)
    DURATION=$((END - START))
    echo ""
    echo "Bitiş: $(date +%H:%M:%S)"
    echo "⏱️  Süre: ${DURATION} saniye (Ortalama: $(echo "scale=2; $DURATION/10" | bc)s/request)"
}

test_all() {
    test_positive
    sleep 1
    test_conflict
    sleep 1
    test_imbalanced
    sleep 1
    test_whatsapp
    sleep 1
    test_performance
}

# Ana menü
check_backend

echo ""
echo "Test Senaryoları:"
echo "1) Pozitif İlişki"
echo "2) Çatışmalı İlişki"
echo "3) Dengesiz İletişim"
echo "4) WhatsApp Parser"
echo "5) Performans Testi"
echo "6) Tüm Testler"
echo ""

if [ -z "$1" ]; then
    read -p "Seçim (1-6): " choice
else
    choice=$1
fi

case $choice in
    1) test_positive ;;
    2) test_conflict ;;
    3) test_imbalanced ;;
    4) test_whatsapp ;;
    5) test_performance ;;
    6) test_all ;;
    *) echo "❌ Geçersiz seçim!" ;;
esac

echo ""
echo "✅ Test tamamlandı!"
echo ""
echo "💡 İpuçları:"
echo "   - Tam sonuçlar için: curl -s URL | python -m json.tool"
echo "   - Frontend test: http://localhost:3000"
echo "   - Detaylı testler: python -m pytest tests/ -v"
echo ""
