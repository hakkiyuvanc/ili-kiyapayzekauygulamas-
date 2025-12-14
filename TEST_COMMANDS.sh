#!/bin/bash
# Test Script - İlişki Analiz AI

echo "======================================================================"
echo "🎯 İLİŞKİ ANALİZ AI - TEST KOMUTLARI"
echo "======================================================================"
echo ""
echo "Aşağıdaki komutları terminal'de çalıştırabilirsiniz:"
echo ""
echo "======================================================================"
echo "1. BACKEND HEALTH CHECK"
echo "======================================================================"
echo ""
echo "curl http://localhost:8000/health | python -m json.tool"
echo ""
echo "======================================================================"
echo "2. ANALİZ TESTİ (Kısa Metin)"
echo "======================================================================"
echo ""
cat << 'EOF'
curl -X POST "http://localhost:8000/api/analysis/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Ali: Bugün harika bir gün geçirdik canım\nAyşe: Evet aşkım, ben de çok mutluyum",
    "format_type": "simple"
  }' | python -m json.tool
EOF
echo ""
echo "======================================================================"
echo "3. ANALİZ TESTİ (Uzun Konuşma)"
echo "======================================================================"
echo ""
cat << 'EOF'
curl -X POST "http://localhost:8000/api/analysis/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Ahmet: Merhaba canım, bugün nasıl geçti?\nAyşe: İyi geçti aşkım, teşekkür ederim. Sen nasılsın?\nAhmet: Ben de iyiyim. Akşam birlikte yemek yiyelim mi?\nAyşe: Harika fikir! Severim seni.\nAhmet: Ben de seni çok seviyorum bebeğim.",
    "format_type": "simple",
    "privacy_mode": true
  }' | python -m json.tool
EOF
echo ""
echo "======================================================================"
echo "4. FRONTEND TEST"
echo "======================================================================"
echo ""
echo "curl -I http://localhost:3000"
echo ""
echo "======================================================================"
echo "5. UNIT TESTLER"
echo "======================================================================"
echo ""
echo "source venv/bin/activate && python -m pytest tests/ -v"
echo ""
echo "======================================================================"
echo "6. AI ENTEGRASYON TESTİ"
echo "======================================================================"
echo ""
echo "source venv/bin/activate && python test_ai_integration.py"
echo ""
echo "======================================================================"
echo "7. HIZLI API TESTİ"
echo "======================================================================"
echo ""
cat << 'EOF'
curl -s -X POST "http://localhost:8000/api/analysis/analyze" \
  -H "Content-Type: application/json" \
  -d '{"text": "A: Seni seviyorum\nB: Ben de", "format_type": "simple"}' | \
  python -c "import sys, json; d=json.load(sys.stdin); print(f'Status: {d[\"status\"]}, Score: {d[\"overall_score\"]}/10')"
EOF
echo ""
echo "======================================================================"
echo "8. WHATSAPP KONUŞMA TESTİ"
echo "======================================================================"
echo ""
cat << 'EOF'
curl -X POST "http://localhost:8000/api/analysis/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "10/12/2024, 14:30 - Ali: Merhaba\n10/12/2024, 14:31 - Ayşe: Selam nasılsın?",
    "format_type": "whatsapp"
  }' | python -m json.tool
EOF
echo ""
echo "======================================================================"
echo "9. METRIKLER DETAYLI TEST"
echo "======================================================================"
echo ""
cat << 'EOF'
curl -s -X POST "http://localhost:8000/api/analysis/analyze" \
  -H "Content-Type: application/json" \
  -d '{"text": "A: Merhaba\nB: Selam", "format_type": "simple"}' | \
  python -c "import sys, json; d=json.load(sys.stdin); m=d['metrics']; print(f'Duygu: {m[\"sentiment\"][\"score\"]:.1f}%\\nEmpati: {m[\"empathy\"][\"score\"]:.1f}%\\nÇatışma: {m[\"conflict\"][\"score\"]:.1f}%\\nBiz-dili: {m[\"we_language\"][\"score\"]:.1f}%')"
EOF
echo ""
echo "======================================================================"
echo "10. TÜM SİSTEM TESTİ (Python)"
echo "======================================================================"
echo ""
cat << 'PYTEST'
source venv/bin/activate && python << 'EOF'
import subprocess, json

print("\n🎯 SİSTEM DURUMU:\n")

# Backend
result = subprocess.run(['curl', '-s', 'http://localhost:8000/health'], capture_output=True, text=True)
if result.returncode == 0:
    health = json.loads(result.stdout)
    print(f"✅ Backend: {health['status']}")
else:
    print("❌ Backend: Çalışmıyor")

# Frontend
result = subprocess.run(['curl', '-s', '-o', '/dev/null', '-w', '%{http_code}', 'http://localhost:3000'], capture_output=True, text=True)
print(f"{'✅' if result.stdout == '200' else '❌'} Frontend: HTTP {result.stdout}")

# Tests
result = subprocess.run(['python', '-m', 'pytest', 'tests/', '-q'], capture_output=True, text=True)
print(f"{'✅' if '33 passed' in result.stdout else '❌'} Unit Tests: {result.stdout.strip().split()[-1]}")

print("\n")
EOF
PYTEST
echo ""
echo "======================================================================"
echo "💡 İPUCU: Komutları kopyalayıp terminalinizde çalıştırın!"
echo "======================================================================"
