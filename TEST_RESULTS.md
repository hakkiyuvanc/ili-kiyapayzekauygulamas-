# İlişki Analiz AI - API Test Özetleri

## ✅ Başarılı Testler

### 1. Desteklenen Dosya Formatları
**Endpoint:** `GET /api/upload/supported-formats`
- Status: ✅ 200
- Format sayısı: 4 (.txt, .json, .log, .zip)
- Max dosya boyutu: 10MB

### 2. Basit Dosya Yükleme
**Endpoint:** `POST /api/upload/upload`
- Status: ✅ 200
- Test dosyası: 323 bytes
- Format tespiti: ✅ "simple" 
- Mesaj sayısı: 10
- Önizleme: ✅ İlk 200 karakter

### 3. Dosya Yükle ve Analiz
**Endpoint:** `POST /api/upload/upload-and-analyze`
- Status: ✅ 200
- WhatsApp format tespiti: ✅ Çalışıyor
- Metrikler: ✅ 5 metrik hesaplandı
  - Sentiment: 72.73 (Çok Olumlu)
  - Empathy: 0.0 (Çok Düşük)
  - Conflict: 100 (Çok Yüksek) ⚠️
  - We-language: 0.0 (Zayıf)
  - Balance: 91.67 (Mükemmel)
- Overall Score: 31.93/10 ⚠️ (skalada sorun)
- İçgörüler: ✅ 5 adet
- Öneriler: ✅ Oluşturuldu

### 4. Geçersiz Dosya Reddi
**Endpoint:** `POST /api/upload/upload`
- Test: .pdf dosyası
- Status: ✅ 400 (Beklenen hata)
- Hata mesajı: ✅ "Desteklenmeyen dosya formatı"

## ⚠️ Tespit Edilen Sorunlar

### 1. Overall Score Skalası
**Problem:** Score 31.93/10 (10'un üzerinde çıkıyor)
**Sebep:** Metrikler 0-100 arası, overall score 0-10 arası olmalı
**Çözüm:** `report_generator.py` içinde `_calculate_overall_score()` fonksiyonunu düzelt

### 2. Conflict Score Hassasiyeti
**Problem:** Olumlu konuşmada conflict 100 (çok yüksek)
**Test verisi:** "Merhaba canım", "seni özledim", "görüşürüz ❤️"
**Sebep:** Emoji veya diğer karakterler çatışma olarak algılanıyor
**Çözüm:** `relationship_metrics.py` içinde `calculate_conflict_score()` fonksiyonunu kalibre et

### 3. Database Save
**Problem:** `save_to_db=True` olmasına rağmen `analysis_id: N/A`
**Sebep:** DB kaydı yapılmıyor veya response'a eklenmemiş
**Çözüm:** `upload.py` içinde DB kayıt mantığını kontrol et

## 📊 Metrik Kalibrasyon İhtiyacı

### Sentiment Analizi
- ✅ Pozitif kelimeler tespit ediyor (8 pozitif kelime)
- ✅ Negatif kelimeler tespit ediyor (3 negatif kelime)
- ✅ Skor: 72.73 (makul)

### Empathy Analizi
- ⚠️ Empati skorları çok düşük çıkıyor (0.0)
- **Öneri:** Türkçe empati ifadelerini genişlet:
  - "canım", "aşkım", "bebeğim" gibi sevgi ifadeleri
  - "seni özledim", "seni düşünüyorum"
  - Emoji kullanımı (❤️, 😊, 🥰)

### Conflict Analizi
- ❌ False positive: Olumlu konuşmalarda yüksek çatışma
- **Öneri:** 
  - Emoji'leri çatışma göstergesi olarak sayma
  - Büyük harf oranını yeniden kalibre et
  - Ünlem sayısını bağlama göre değerlendir

### We-Language Analizi
- ✅ "Ben/Sen" kelimelerini sayıyor
- ⚠️ "Biz" kelimesi eksik test verisinde (beklenen davranış)

### Communication Balance
- ✅ Mükemmel çalışıyor (91.67)
- ✅ Mesaj ve kelime dağılımını doğru hesaplıyor

## 🔧 Önerilen Düzeltmeler

### 1. Score Normalizasyonu (YÜksek Öncelik)
```python
# ml/features/report_generator.py
def _calculate_overall_score(self, metrics: Dict) -> float:
    # Tüm skorları 0-100 aralığına normalize et
    # Sonra weighted average ile 0-10'a dönüştür
    weighted_sum = (
        metrics['sentiment']['score'] * 0.3 +
        metrics['empathy']['score'] * 0.25 +
        (100 - metrics['conflict']['score']) * 0.2 +
        metrics['we_language']['score'] * 0.15 +
        metrics['communication_balance']['score'] * 0.1
    )
    return round(weighted_sum / 10, 2)  # 0-10 arası
```

### 2. Conflict Kalibrasyonu (Yüksek Öncelik)
```python
# ml/features/relationship_metrics.py
def calculate_conflict_score(self, text: str) -> Dict:
    # Emoji'leri ve özel karakterleri temizle
    clean_text = re.sub(r'[^\w\s!?]', '', text)
    # Ünlem sayısını normalize et (mesaj başına)
    # Büyük harf oranını %30'un üzerinde ise çatışma say
```

### 3. Database Integration (Orta Öncelik)
```python
# backend/app/api/upload.py
# Save to DB kısmını düzelt ve analysis_id'yi response'a ekle
if save_to_db and db_analysis:
    result["analysis_id"] = db_analysis.id
    result["filename"] = file.filename
```

## 📝 Test Senaryoları

### Pozitif Konuşma (Beklenen: Yüksek skor)
```
Ali: Merhaba canım nasılsın?
Ayşe: İyiyim aşkım sen nasılsın?
Ali: Ben de çok iyiyim, seni özledim
```
**Beklenen:** sentiment>70, empathy>50, conflict<30, overall>7

### Çatışmalı Konuşma (Beklenen: Düşük skor)
```
Ali: NEDEN BÖYLE YAPIYORSUN!!!
Ayşe: SEN DE HATA YAPIYORSUN!!!
Ali: BU KABUL EDİLEMEZ!!!
```
**Beklenen:** sentiment<30, conflict>70, overall<4

### Dengeli Konuşma (Beklenen: Orta-yüksek skor)
```
Ali: Bugün işte zor bir gün geçirdim
Ayşe: Anlıyorum, seni dinliyorum
Ali: Teşekkür ederim, konuşmak iyi geldi
```
**Beklenen:** empathy>60, balance>80, overall>6

## 🎯 Sonraki Adımlar

1. ✅ **Tamamlandı:** File upload endpoints
2. 🔄 **Gerekli:** Metrik kalibrasyonu
3. ⏭️ **Sonraki:** Frontend geliştirme (Next.js)
4. ⏭️ **Sonraki:** Visualizasyon (grafikler)
5. ⏭️ **Sonraki:** Unit testler

## 📚 API Endpoints Listesi

### Authentication (3 endpoint)
- ✅ POST /api/auth/register
- ✅ POST /api/auth/login
- ✅ GET /api/auth/me

### Analysis (5 endpoint)
- ✅ POST /api/analysis/analyze
- ✅ POST /api/analysis/quick-score
- ✅ GET /api/analysis/history
- ✅ GET /api/analysis/history/{id}
- ✅ DELETE /api/analysis/history/{id}

### File Upload (3 endpoint)
- ✅ POST /api/upload/upload
- ✅ POST /api/upload/upload-and-analyze
- ✅ GET /api/upload/supported-formats

**Toplam:** 11 endpoint ✅ Çalışıyor
