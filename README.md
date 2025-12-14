# İlişki Analiz AI 💝

> **🖥️ Desktop Uygulama** - Bu proje bir masaüstü uygulamasıdır, web sitesi değildir.

Yapay zeka destekli ilişki analizi ve iletişim değerlendirme uygulaması.

## 🆕 Yeni Özellikler (v1.0.0 - 11 Aralık 2025)

### ⭐ AI Entegrasyonu
- **OpenAI GPT-4o-mini** ve **Anthropic Claude 3.5 Sonnet** desteği
- AI-powered derinlemesine içgörüler
- Kişiselleştirilmiş öneriler
- Türkçe optimize edilmiş promptlar
- Rule-based fallback (AI olmadan da çalışır)

### ⭐ Desktop App Altyapısı
- **Electron** ile cross-platform desktop app
- Backend auto-start (kullanıcı manuel başlatmaz)
- macOS, Windows, Linux desteği
- Modern installer/builder yapılandırması

## 🎯 Temel Özellikler

- **Türkçe NLP Analizi**: İletişim metinlerinin doğal dil işleme ile analizi
- **5 Analiz Metriği**: Duygu, empati, çatışma, biz-dili, denge
- **AI Destekli İçgörüler**: GPT-4o-mini veya Claude 3.5 Sonnet ile
- **WhatsApp Desteği**: Sohbet geçmişi import
- **Gizlilik Odaklı**: KVKK/GDPR uyumlu veri işleme
- **Modern UI**: Next.js + Tailwind CSS tasarım

## 🚀 Kurulum

### Gereksinimler
- Python 3.10+
- PostgreSQL 14+ (opsiyonel, SQLite ile başlar)

### Adımlar

```bash
# Repository'yi klonla
git clone https://github.com/hakkiyuvanc/ili-kiyapayzekauygulamas-.git
cd ili-kiyapayzekauygulamas-

# Virtual environment oluştur
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Bağımlılıkları yükle
pip install -e ".[dev]"

# Türkçe NLP modeli indir
python -m spacy download tr_core_news_lg

# Environment dosyası oluştur
cp .env.example .env

# Veritabanı migration
alembic upgrade head

# Development server başlat
uvicorn backend.app.main:app --reload
```

## 📁 Proje Yapısı

```
ili-kiyapayzekauygulamas-/
├── backend/
│   ├── app/
│   │   ├── api/          # API endpoints
│   │   ├── core/         # Config, security, database
│   │   ├── models/       # Database models
│   │   ├── schemas/      # Pydantic schemas
│   │   ├── services/     # Business logic
│   │   └── main.py       # FastAPI app
│   └── alembic/          # Database migrations
├── ml/
│   ├── preprocessing/    # Text preprocessing
│   ├── features/         # Feature extraction
│   ├── models/           # ML models
│   └── evaluation/       # Metrics & testing
├── frontend/             # Next.js UI (gelecek)
├── tests/                # Test suite
├── scripts/              # Utility scripts
├── docs/                 # Documentation
└── pyproject.toml        # Dependencies
```

## 🧪 Test

```bash
# Tüm testleri çalıştır
pytest

# Coverage ile
pytest --cov=backend --cov=ml --cov-report=html
```

## 🐳 Docker

```bash
# Build
docker-compose build

# Run
docker-compose up
```

## 📝 API Dokümantasyonu

Server başladıktan sonra:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 🔒 Güvenlik ve Gizlilik

- JWT token authentication
- Password hashing (bcrypt)
- PII detection ve masking
- KVKK uyumlu data retention
- End-to-end encryption (planlı)

## 🗺️ Roadmap

- [x] Proje altyapısı
- [x] Temel NLP analiz motoru
- [ ] FastAPI backend
- [ ] Next.js frontend
- [ ] WhatsApp parser
- [ ] ML model training
- [ ] Production deployment

## 📄 Lisans

MIT License - detaylar için LICENSE dosyasına bakın.

## 🤝 Katkıda Bulunma

Pull request'ler memnuniyetle karşılanır. Büyük değişiklikler için lütfen önce bir issue açın.

## 📧 İletişim

Sorular için: [GitHub Issues](https://github.com/hakkiyuvanc/ili-kiyapayzekauygulamas-/issues)
