# V3.0 Test Planı - Manuel Test Rehberi

## 🧪 Test Senaryoları

### Test 1: Frontend Build Kontrolü
```bash
cd frontend
npm run dev
# Beklenen: ✅ Compiled successfully
# URL: http://localhost:3000
```

**Kontrol Edilecekler:**
- [ ] Build hatasız tamamlandı mı?
- [ ] Console'da TypeScript hatası var mı?
- [ ] Chart componentleri import edildi mi?

### Test 2: Backend API Kontrolü
```bash
cd backend
source ../venv/bin/activate
python -m uvicorn app.main:app --reload
# Beklenen: ✅ Application startup complete
# URL: http://localhost:8000
```

**Kontrol Edilecekler:**
- [ ] Backend başladı mı?
- [ ] AI Service initialized log'u var mı?
- [ ] Version: v3.0 görünüyor mu?

### Test 3: Yeni Chart Componentlerini Test Etme

#### Adım 1: Uygulamaya Giriş
1. Browser'da `http://localhost:3000` aç
2. Guest olarak giriş yap veya kayıt ol
3. Dashboard'a git

#### Adım 2: Analiz Yap
1. "Yeni Analiz" butonuna tıkla
2. Örnek bir konuşma metni gir:
```
Ben: Bugün çok yorgunum, seninle konuşmak istemiyorum.
Sen: Anlıyorum, dinlenmene ihtiyacın var. Yarın konuşalım mı?
Ben: Evet, teşekkür ederim. Seni seviyorum.
Sen: Ben de seni seviyorum. İyi dinlenmeler.
```
3. "Analiz Et" butonuna tıkla

#### Adım 3: Sonuçları Kontrol Et
**Beklenen Görüntü:**

1. **MetricCards (4 Kart):**
   - ✅ İlişki Sağlığı kartı (Heart icon, progress bar)
   - ✅ Yakınlık Seviyesi kartı (Sparkles icon)
   - ✅ Toksisite kartı (AlertTriangle icon)
   - ✅ Risk Seviyesi kartı (TrendingUp icon)
   - ✅ Animasyonlar çalışıyor mu?
   - ✅ Renkler doğru mu? (yeşil/amber/kırmızı)

2. **GottmanRadarChart:**
   - ✅ Radar chart render oluyor mu?
   - ✅ 7 Gottman prensibi görünüyor mu?
   - ✅ Tooltip çalışıyor mu?
   - ✅ Durum göstergeleri (Mükemmel, İyi, Orta, etc.) görünüyor mu?
   - ✅ Renk paleti romantic iOS temasına uygun mu?

3. **Legacy Panel:**
   - ✅ Eski RelationshipHealthPanel hala görünüyor mu?
   - ✅ Yeni ve eski componentler uyumlu mu?

### Test 4: Console Log Kontrolü

**Browser Console'da Bakılacaklar:**
```javascript
// Beklenen loglar:
// ✅ "AI insights generated successfully (V3.0)"
// ✅ "AI recommendations generated (V3.0)"
// ✅ "Structured LLM call successful"

// Olmaması gerekenler:
// ❌ TypeScript errors
// ❌ "Cannot read property of undefined"
// ❌ Chart rendering errors
```

**Backend Console'da Bakılacaklar:**
```python
# Beklenen loglar:
# ✅ "AI Service initialized" with "prompt_version": "v3.0"
# ✅ "Structured LLM call successful"
# ✅ "AI insights generated successfully (V3.0)"
# ✅ "AI recommendations generated (V3.0)"

# Olmaması gerekenler:
# ❌ ValidationError
# ❌ JSONDecodeError
# ❌ "Structured LLM call failed after all retries"
```

### Test 5: Network Tab Kontrolü

**API Çağrıları:**
1. `/api/analysis/analyze` - POST
   - Status: 200 OK
   - Response içinde `gottman_report` var mı?
   - `genel_karne`, `gottman_bilesenleri`, `duygusal_analiz` alanları dolu mu?

### Test 6: Responsive Test

**Farklı Ekran Boyutları:**
- [ ] Desktop (1920x1080): Chart'lar yan yana
- [ ] Tablet (768px): 2 sütun
- [ ] Mobile (375px): 1 sütun
- [ ] MetricCards grid düzgün çalışıyor mu?

### Test 7: Animation Test

**Kontrol Edilecek Animasyonlar:**
- [ ] MetricCards fade-in (delay-75)
- [ ] GottmanRadarChart fade-in (delay-100)
- [ ] Legacy panel fade-in (delay-150)
- [ ] Progress bar'lar dolma animasyonu
- [ ] Hover effects

## 🐛 Bilinen Sorunlar ve Çözümleri

### Sorun 1: TypeScript Type Errors
**Belirtiler:** Console'da type mismatch hataları
**Çözüm:** `as any` type assertions zaten eklendi, ancak hala hata varsa:
```typescript
// AnalysisResult.tsx içinde
generalReport={result.gottman_report.genel_karne as any}
emotionalAnalysis={result.gottman_report.duygusal_analiz as any}
metrics={result.gottman_report.gottman_bilesenleri as any}
```

### Sorun 2: Chart Render Olmuyor
**Belirtiler:** Boş alan veya "undefined" hatası
**Çözüm:** 
1. `recharts` kurulu mu kontrol et: `npm list recharts`
2. Data formatı doğru mu kontrol et
3. Console'da hata var mı bak

### Sorun 3: Backend Validation Error
**Belirtiler:** "Structured LLM call failed" log'u
**Çözüm:**
1. AI provider API key'i doğru mu?
2. `_build_insights_prompt_v3()` metodu eklendi mi?
3. `_build_recommendations_prompt_v3()` metodu eklendi mi?

## ✅ Başarı Kriterleri

Test başarılı sayılır eğer:
- [x] Frontend hatasız build oluyor
- [x] Backend v3.0 ile başlıyor
- [ ] MetricCards 4 kart gösteriyor
- [ ] GottmanRadarChart render oluyor
- [ ] Animasyonlar çalışıyor
- [ ] Console'da kritik hata yok
- [ ] API çağrıları 200 OK dönüyor
- [ ] Responsive design çalışıyor

## 📸 Screenshot Checklist

Aşağıdaki ekran görüntülerini alın:
1. [ ] Ana sayfa (landing page)
2. [ ] Dashboard
3. [ ] Analiz formu
4. [ ] Analiz sonuçları (MetricCards görünür)
5. [ ] Analiz sonuçları (GottmanRadarChart görünür)
6. [ ] Browser console (log'lar)
7. [ ] Backend terminal (log'lar)
8. [ ] Network tab (API response)

## 🎯 Sonuç Raporu Şablonu

Test tamamlandığında doldurun:

```markdown
# V3.0 Test Sonuçları

## Tarih: [YYYY-MM-DD]
## Test Eden: [İsim]

### Frontend
- Build Status: ✅/❌
- TypeScript Errors: Var/Yok
- Chart Render: ✅/❌
- Animations: ✅/❌

### Backend
- Startup: ✅/❌
- Version: v3.0 ✅/❌
- Structured Calls: ✅/❌
- Validation: ✅/❌

### UI/UX
- MetricCards: ✅/❌
- GottmanRadarChart: ✅/❌
- Responsive: ✅/❌
- Animations: ✅/❌

### Bulunan Hatalar
1. [Hata açıklaması]
2. [Hata açıklaması]

### Notlar
[Ek gözlemler]
```

## 🚀 Hızlı Test Komutu

Tüm testleri hızlıca çalıştırmak için:
```bash
# Terminal 1: Backend
cd backend
source ../venv/bin/activate
python -m uvicorn app.main:app --reload

# Terminal 2: Frontend
cd frontend
npm run dev

# Terminal 3: Test
curl http://localhost:8000/health
curl http://localhost:3000
```

## 📞 Destek

Sorun yaşarsanız:
1. Console log'larını kontrol edin
2. Network tab'ı kontrol edin
3. V3_FINAL_STATUS.md dosyasına bakın
4. GitHub issues'a rapor edin
```
