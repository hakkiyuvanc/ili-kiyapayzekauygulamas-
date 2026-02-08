# 🚀 İLK ÇALIŞTIRMA REHBERİ

## ✅ Tamamlanan Adımlar

### Phase 1: Core Infrastructure ✅

- ✅ Proje yapısı oluşturuldu
- ✅ Dependencies ayarlandı
- ✅ Türkçe NLP preprocessing motoru (simple + spaCy optional)
- ✅ 5 temel analiz metriği (sentiment, empati, çatışma, biz-dili, iletişim dengesi)
- ✅ Rapor oluşturma motoru
- ✅ WhatsApp konuşma parser
- ✅ Kişiselleştirilmiş öneriler

### Phase 2: Backend API ✅

- ✅ FastAPI yapısı
- ✅ API endpoints (`/api/analysis/analyze`, `/api/analysis/quick-score`)
- ✅ Request/Response schemas
- ✅ Service layer architecture

## 🎯 Şu Anda Çalışan Özellikler

1. **Metin Analizi**: Konuşma ve düz metin analizi
2. **Format Desteği**: WhatsApp export, basit format, düz metin
3. **5 Metrik**: Sentiment, empati, çatışma, biz-dili, iletişim dengesi
4. **Akıllı Raporlama**: İçgörüler ve öneriler
5. **REST API**: `/api/analysis/*` endpoints

## 📦 Hızlı Başlangıç

### 1. Virtual Environment Aktive Et

```bash
source venv/bin/activate
```

### 2. Server'ı Başlat

```bash
python -m uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
```

### 3. API Dokümantasyonu

Browser'da aç: http://127.0.0.1:8000/docs

### 4. Test Et

```bash
python test_direct.py
```

## 🧪 Örnek API Kullanımı

### Python ile:

```python
from ml.analyzer import get_analyzer

analyzer = get_analyzer()
result = analyzer.analyze_text(
    text="Ahmet: Merhaba canım!\nAyşe: Merhaba aşkım, nasılsın?",
    format_type="simple",
    privacy_mode=True
)

print(f"Genel Skor: {result['overall_score']}/100")
```

### cURL ile:

```bash
curl -X POST "http://127.0.0.1:8000/api/analysis/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Ahmet: Merhaba canım!\nAyşe: Merhaba aşkım!",
    "format_type": "simple",
    "privacy_mode": true
  }'
```

## 📊 Örnek Çıktı

```json
{
  "status": "success",
  "overall_score": 72.5,
  "summary": "İletişiminiz genel olarak pozitif...",
  "metrics": {
    "sentiment": {"score": 75.0, "label": "Çok Olumlu"},
    "empathy": {"score": 45.0, "label": "Orta"},
    "conflict": {"score": 15.0, "label": "Düşük"},
    "we_language": {"score": 65.0, "label": "Güçlü Biz-dili"},
    "communication_balance": {"score": 80.0, "label": "Mükemmel Denge"}
  },
  "insights": [...],
  "recommendations": [...]
}
```

## 🔜 Sonraki Adımlar

### Kısa Vadeli (Bu Hafta)

- [ ] Database models (SQLAlchemy)
- [ ] User authentication (JWT)
- [ ] File upload endpoint
- [ ] Unit tests

### Orta Vadeli (Gelecek Hafta)

- [ ] Next.js frontend
- [ ] Report visualization
- [ ] User dashboard
- [ ] History tracking

### Uzun Vadeli

- [ ] ML model training
- [ ] Advanced analytics
- [ ] Real-time analysis
- [ ] Mobile app

## 📝 Notlar

- **spaCy**: Opsiyonel - yoksa simple preprocessor devreye girer
- **Database**: Şu an gerekli değil - bellekte çalışıyor
- **Production**: Docker + PostgreSQL + nginx için hazır

## 🐛 Bilinen Sorunlar

- Conflict metriği bazı pozitif metinlerde yüksek çıkabiliyor (ince ayar gerekli)
- WhatsApp timestamp parsing için daha fazla format desteği eklenecek

## 💡 Öneriler

1. **spaCy kurulumu** (opsiyonel ama daha iyi sonuçlar):

   ```bash
   pip install spacy
   python -m spacy download tr_core_news_lg
   ```

2. **Production için**:

   ```bash
   pip install -e .  # Full install with all dependencies
   ```

3. **Development için**:
   ```bash
   pip install -r requirements-minimal.txt  # Lightweight
   ```

---

**🎉 MVP Hazır! Backend API ve analiz motoru çalışır durumda.**
