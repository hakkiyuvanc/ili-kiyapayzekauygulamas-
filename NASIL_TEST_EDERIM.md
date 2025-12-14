# 🧪 Test Rehberi - Nasıl Test Edebilirim?

**Tarih:** 12 Aralık 2025  
**Amaç:** Sistemi kendiniz test etmeniz için pratik rehber

---

## 🚀 Hızlı Başlangıç (1 dakika)

### 1. Sistem Durumunu Kontrol Et
```bash
# Backend çalışıyor mu?
curl http://localhost:8000/health

# Frontend çalışıyor mu?
curl http://localhost:3000

# Her ikisi de çalışmıyorsa, başlat:
./start.sh
```

### 2. Tarayıcıda Aç
```
http://localhost:3000
```

### 3. İlk Test - WhatsApp Konuşması Analizi
1. Ana sayfada "Analiz Başlat" butonuna tıkla
2. Örnek bir konuşma yapıştır:
```
Ali: Nasılsın canım? 😊
Ayşe: İyiyim aşkım, sen nasılsın?
Ali: Çok iyiyim! Bugün seninle buluşacağımız için heyecanlıyım ❤️
Ayşe: Ben de çok heyecanlıyım! Saat kaçta buluşuyoruz?
Ali: Saat 7'de restoranda olabilir miyiz?
Ayşe: Tabii ki! Görüşürüz o zaman 😘
```
3. "Analiz Et" butonuna tıkla
4. Sonuçları gör!

---

## 📋 Detaylı Test Senaryoları

### Senaryo 1: Pozitif İlişki Testi
**Amaç:** Sağlıklı bir ilişki konuşmasını test et

**Test Datası:**
```
Deniz: Günaydın aşkım! Kahvaltı hazırladım sana ☕
Selin: Çok tatlısın! Teşekkür ederim canım 💕
Deniz: Bugün işten sonra yürüyüşe çıkalım mı?
Selin: Harika fikir! Deniz kenarına gidelim istersen
Deniz: Mükemmel! Saat 6'da hazır ol 😊
Selin: Tamam aşkım, görüşürüz! Seni seviyorum ❤️
Deniz: Ben de seni çok seviyorum 💖
```

**Beklenen Sonuç:**
- Duygu Skoru: ~85-95% (Çok Olumlu)
- Empati: ~90-100% (Yüksek)
- İletişim Dengesi: ~45-55% (Dengeli)
- Çatışma: ~0-5% (Çok Düşük)

---

### Senaryo 2: Çatışma Testi
**Amaç:** Çatışmalı bir konuşmayı test et

**Test Datası:**
```
Ahmet: Neden hiç aramadın?
Zeynep: Çok yoğundum, anlayışlı ol lütfen
Ahmet: Her zaman bahane buluyorsun
Zeynep: Bahane değil, gerçekten çok işim vardı!
Ahmet: Sen hiç beni düşünmüyorsun
Zeynep: Haksızlık ediyorsun, bunu nasıl söylersin?
Ahmet: Çünkü doğru!
Zeynep: Artık konuşmak istemiyorum
```

**Beklenen Sonuç:**
- Duygu Skoru: ~20-40% (Olumsuz)
- Empati: ~10-30% (Düşük)
- Çatışma: ~70-90% (Yüksek)
- İletişim Dengesi: Dengeli olabilir (her iki taraf da konuşuyor)

---

### Senaryo 3: Tek Taraflı İletişim Testi
**Amaç:** Dengesiz iletişimi test et

**Test Datası:**
```
Can: Bugün çok güzel bir gün geçirdim! Sabah koşuya gittim, sonra kahvaltı yaptım. Öğleden sonra arkadaşlarla buluştuk. Akşam da sinemaya gittik. Sen ne yaptın?
Ece: İyiymiş
Can: Film çok güzeldi! Senin de izlemen lazım. Ayrıca yeni bir restoran keşfettim. Önümüzdeki hafta gidelim mi?
Ece: Olur
Can: Harika! Cumartesi uygun mu?
Ece: Tamam
```

**Beklenen Sonuç:**
- İletişim Dengesi: ~70-30 veya daha fazla (Dengesiz)
- Empati: Düşük (Ece'den yeterli yanıt yok)
- "Biz" Dili: Düşük

---

### Senaryo 4: Emoji ve İfade Testi
**Amaç:** Emoji'lerin sentiment analizine etkisini test et

**Test Datası:**
```
Mert: ❤️❤️❤️
Elif: 😊😊😊
Mert: 🌹🌹🌹
Elif: 💕💕💕
Mert: 😘😘😘
Elif: 🥰🥰🥰
```

**Beklenen Sonuç:**
- Duygu Skoru: Çok Yüksek (90%+)
- Empati: Yüksek
- Kısa mesajlar uyarısı olabilir

---

### Senaryo 5: Uzun Konuşma Testi
**Amaç:** Performansı test et (100+ mesaj)

**Test Komutu:**
```bash
# 100 mesajlık uzun konuşma testi
curl -X POST http://localhost:8000/api/v1/analysis/analyze \
  -H "Content-Type: application/json" \
  -d @tests/data/long_conversation.json
```

**Beklenen Sonuç:**
- Yanıt süresi: <5 saniye
- Detaylı istatistikler
- Tüm metriklerin hesaplanması

---

## 🔧 Teknik Testler

### API Endpoint Testleri

#### 1. Health Check
```bash
curl http://localhost:8000/health
```
**Beklenen:** `{"status": "healthy"}`

#### 2. Analiz Endpoint
```bash
curl -X POST http://localhost:8000/api/v1/analysis/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"sender": "Ali", "text": "Merhaba canım!"},
      {"sender": "Ayşe", "text": "Merhaba aşkım!"}
    ]
  }'
```

#### 3. WhatsApp Parser Test
```bash
curl -X POST http://localhost:8000/api/v1/whatsapp/parse \
  -H "Content-Type: application/json" \
  -d '{
    "text": "01.01.2024, 10:30 - Ali: Merhaba\n01.01.2024, 10:31 - Ayşe: Selam"
  }'
```

#### 4. Export Test (PDF)
```bash
curl -X POST http://localhost:8000/api/v1/export/pdf \
  -H "Content-Type: application/json" \
  -d '{
    "report": {
      "metrics": {"sentiment_score": 85.5},
      "summary": "Test raporu"
    }
  }' \
  --output test_report.pdf
```

---

## 🧪 Otomatik Testler

### Unit Testler (Tüm Backend)
```bash
# Tüm testleri çalıştır
cd /Users/hakkiyuvanc/GİTHUB/ilişki\ yapay\ zeka/ili-kiyapayzekauygulamas-
source venv/bin/activate
python -m pytest tests/ -v

# Sadece belirli bir test
python -m pytest tests/test_analysis.py -v

# Coverage ile
python -m pytest tests/ --cov=backend --cov-report=html
```

**Beklenen:** Tüm testler geçmeli (33/33 ✅)

### Frontend Testleri
```bash
cd frontend
npm test
```

### Integration Testleri
```bash
# Tam sistem testi
python -m pytest tests/integration/ -v
```

---

## 🖥️ Desktop App Testi

### 1. Development Mode
```bash
cd frontend
npm run electron:dev
```

**Test Adımları:**
1. Uygulama açılıyor mu?
2. Backend otomatik başlıyor mu?
3. Ana sayfa yükleniyor mu?
4. Analiz yapabiliyor musun?
5. Menüler çalışıyor mu?

### 2. Production Build Test
```bash
# Build yap
npm run electron:build

# macOS
open dist/mac/İlişki\ Analizi.app

# Windows
./dist/win-unpacked/İlişki\ Analizi.exe
```

---

## 📊 Performans Testleri

### 1. Yük Testi (100 concurrent request)
```bash
# Apache Bench
ab -n 1000 -c 100 http://localhost:8000/health

# Vegeta
echo "POST http://localhost:8000/api/v1/analysis/analyze" | \
  vegeta attack -duration=30s -rate=50 | \
  vegeta report
```

### 2. Response Time Test
```bash
# Ortalama yanıt süresi
for i in {1..10}; do
  time curl -X POST http://localhost:8000/api/v1/analysis/analyze \
    -H "Content-Type: application/json" \
    -d '{"messages": [{"sender": "A", "text": "Test"}]}'
done
```

---

## 🎯 Kullanıcı Deneyimi Testleri

### UX Test Checklist
- [ ] **İlk Yükleme:** Sayfa <3 saniyede yükleniyor mu?
- [ ] **Responsive:** Mobil görünüm (375px) düzgün mü?
- [ ] **Form Validasyonu:** Boş input hata veriyor mu?
- [ ] **Loading States:** Yükleme göstergeleri görünüyor mu?
- [ ] **Error Handling:** Hata mesajları anlaşılır mı?
- [ ] **Accessibility:** Tab ile gezinebiliyor musun?
- [ ] **Dark Mode:** Karanlık tema çalışıyor mu?
- [ ] **Export:** PDF indirme çalışıyor mu?

### A/B Test Senaryoları
1. **Farklı konuşma uzunlukları:** 5, 50, 500 mesaj
2. **Farklı diller:** Türkçe, İngilizce karışımı
3. **Farklı emoji yoğunluğu:** Çok emoji, az emoji, hiç emoji
4. **Farklı ilişki türleri:** Yeni ilişki, uzun süreli, çatışmalı

---

## 🐛 Bug Testi (Edge Cases)

### Test Edilmesi Gerekenler
```bash
# Boş mesaj listesi
curl -X POST http://localhost:8000/api/v1/analysis/analyze \
  -H "Content-Type: application/json" \
  -d '{"messages": []}'

# Tek mesaj
curl -X POST http://localhost:8000/api/v1/analysis/analyze \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"sender": "A", "text": "Test"}]}'

# Çok uzun mesaj (10000 karakter)
curl -X POST http://localhost:8000/api/v1/analysis/analyze \
  -H "Content-Type: application/json" \
  -d "{\"messages\": [{\"sender\": \"A\", \"text\": \"$(python -c 'print(\"a\"*10000)')\"}]}"

# Özel karakterler
curl -X POST http://localhost:8000/api/v1/analysis/analyze \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"sender": "A", "text": "🔥💯🚀<script>alert(1)</script>"}]}'

# Türkçe karakterler
curl -X POST http://localhost:8000/api/v1/analysis/analyze \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"sender": "A", "text": "Şişli'de çay içelim mi? Ğüzel olur!"}]}'
```

---

## 📱 Farklı Platformlarda Test

### macOS
```bash
# Chrome
open -a "Google Chrome" http://localhost:3000

# Safari
open -a Safari http://localhost:3000

# Firefox
open -a Firefox http://localhost:3000
```

### Windows (WSL)
```bash
# Edge
cmd.exe /c start microsoft-edge:http://localhost:3000
```

### Mobil Test (Ngrok ile)
```bash
# Ngrok başlat
ngrok http 3000

# Mobil cihazdan açılan URL'e git
# Örnek: https://abc123.ngrok.io
```

---

## ✅ Test Sonuçları Kaydetme

### Test Raporu Şablonu
```markdown
## Test Raporu - [Tarih]

### Ortam
- OS: macOS 14.0
- Browser: Chrome 120
- Python: 3.11
- Node: 20.10

### Test Edilen Özellikler
- [x] API Health Check
- [x] WhatsApp Parser
- [x] Sentiment Analysis
- [x] PDF Export
- [ ] Mobile Responsive

### Bulunan Buglar
1. Bug #1: PDF export'ta Türkçe karakter sorunu
   - Öncelik: Yüksek
   - Detay: ...

### Performans Metrikleri
- API Response Time: 245ms (avg)
- Page Load Time: 1.8s
- Bundle Size: 185KB

### Öneriler
1. ...
2. ...
```

---

## 🎓 Test Öğrenme Kaynakları

### Video Tutoriallar (Yapılacak)
- [ ] "İlk Analizinizi Yapın" (5 dk)
- [ ] "WhatsApp Verisi Nasıl Alınır?" (3 dk)
- [ ] "Sonuçları Nasıl Yorumlarım?" (7 dk)

### Örnek Test Dataları
```bash
# Örnek konuşmaları indir
ls tests/data/
# - sample_positive.json
# - sample_conflict.json
# - sample_long.json
# - sample_whatsapp.txt
```

---

## 🚨 Acil Sorun Giderme

### Backend çalışmıyor
```bash
# Log'ları kontrol et
tail -f backend/logs/app.log

# Yeniden başlat
pkill -f "python -m backend.app.main"
cd /Users/hakkiyuvanc/GİTHUB/ilişki\ yapay\ zeka/ili-kiyapayzekauygulamas-
source venv/bin/activate
python -m backend.app.main
```

### Frontend çalışmıyor
```bash
# Node process'i kontrol et
lsof -i :3000

# Yeniden başlat
cd frontend
npm run dev
```

### Port çakışması
```bash
# Port 8000'i kullanan process
lsof -ti:8000 | xargs kill -9

# Port 3000'i kullanan process
lsof -ti:3000 | xargs kill -9
```

---

## 📞 Yardım & Destek

### Test sırasında sorun mu yaşıyorsunuz?

1. **GitHub Issues:** Yeni issue aç
2. **Dokumentasyon:** `README.md`, `DESKTOP_APP.md`
3. **Test Komutları:** `TEST_COMMANDS.sh`
4. **Logs:** `backend/logs/` klasörünü kontrol et

---

**Mutlu testler! 🎉**

Son güncelleme: 12 Aralık 2025
