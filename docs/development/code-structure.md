# 📁 Kod Yapısı ve Organizasyon

> **İlişki Analiz AI** - Proje yapısı ve klasör organizasyon rehberi

Bu dokuman projenin tüm klasör ve dosya yapısını, her bileşenin amacını ve nasıl çalıştığını açıklar.

## 📊 Proje Genel Bakış

```
ili-kiyapayzekauygulamas-/
├── backend/              # FastAPI Backend Server
├── frontend/             # Next.js + Electron Frontend
├── ml/                   # Machine Learning Modelleri
├── tests/                # Test Suite
├── scripts/              # Utility Scripts
├── data/                 # Veri Dosyaları
└── docs/                 # Ek Dokümantasyon
```

## 🔧 Backend Yapısı

### Dizin Ağacı

```
backend/
├── app/
│   ├── api/              # API Endpoints
│   │   ├── analysis.py   # Analiz endpoint'leri
│   │   ├── auth.py       # Kimlik doğrulama
│   │   ├── chat.py       # AI sohbet
│   │   ├── coaching.py   # Coaching özellikleri
│   │   ├── daily.py      # Günlük pulse/checkup
│   │   ├── stats.py      # İstatistikler
│   │   ├── subscription.py # Abonelik yönetimi
│   │   ├── system.py     # Sistem endpoint'leri
│   │   ├── upload.py     # Dosya yükleme
│   │   └── users.py      # Kullanıcı yönetimi
│   │
│   ├── core/             # Çekirdek Modüller
│   │   ├── config.py     # Uygulama yapılandırması
│   │   ├── database.py   # Database bağlantısı
│   │   ├── security.py   # JWT, password hashing
│   │   ├── cache.py      # Redis cache layer
│   │   ├── limiter.py    # Rate limiting
│   │   ├── performance.py # Performance monitoring
│   │   ├── rate_limit.py # Rate limit decorators
│   │   └── file_utils.py # Dosya işlemleri
│   │
│   ├── models/           # Database Models
│   │   └── database.py   # SQLAlchemy modelleri
│   │
│   ├── schemas/          # Pydantic Schemas
│   │   ├── analysis.py   # Analiz şemaları
│   │   ├── auth.py       # Auth şemaları
│   │   ├── coaching.py   # Coaching şemaları
│   │   ├── file.py       # Dosya şemaları
│   │   └── user.py       # Kullanıcı şemaları
│   │
│   ├── services/         # Business Logic
│   │   ├── ai_service.py       # OpenAI/Anthropic entegrasyonu
│   │   ├── analysis_service.py # Metin analizi
│   │   ├── audio_service.py    # Ses işleme
│   │   ├── crud.py             # Database CRUD işlemleri
│   │   ├── email_service.py    # Email gönderimi
│   │   ├── payment.py          # Ödeme işlemleri
│   │   └── report_service.py   # Rapor oluşturma
│   │
│   └── main.py           # FastAPI Application
│
├── alembic/              # Database Migrations
└── venv/                 # Python Virtual Environment
```

### Katman Mimarisi

```mermaid
graph TB
    A[FastAPI App main.py] --> B[API Endpoints /api]
    B --> C[Schemas /schemas]
    C --> D[Services /services]
    D --> E[Models /models]
    E --> F[(Database)]
    D --> G[External APIs]
    B --> H[Core /core]
    H --> D
```

### API Endpoints Kategorileri

#### 🔐 Authentication (`/api/auth.py`)
- `POST /auth/register` - Yeni kullanıcı kaydı
- `POST /auth/login` - Giriş ve JWT token
- `POST /auth/verify-email` - Email doğrulama
- `POST /auth/refresh` - Token yenileme

#### 📊 Analysis (`/api/analysis.py`)
- `POST /analysis/text` - Metin analizi başlat
- `GET /analysis/{id}` - Analiz sonuçlarını getir
- `GET /analysis/history` - Analiz geçmişi
- `DELETE /analysis/{id}` - Analiz sil

#### 💬 Chat (`/api/chat.py`)
- `POST /chat/send` - AI ile sohbet
- `GET /chat/history` - Sohbet geçmişi
- `DELETE /chat/clear` - Geçmişi temizle

#### 📈 Daily Pulse (`/api/daily.py`)
- `POST /daily/checkup` - Günlük check-in
- `GET /daily/insights` - Günlük içgörüler
- `GET /daily/streak` - Günlük seri

#### 📤 Upload (`/api/upload.py`)
- `POST /upload/whatsapp` - WhatsApp chat yükle
- `POST /upload/audio` - Ses dosyası yükle
- `GET /upload/status/{id}` - Yükleme durumu

### Service Layer Sorumlulukları

#### 🤖 AI Service (`ai_service.py`)
**Amaç**: OpenAI ve Anthropic API entegrasyonları
- GPT-4o-mini ile analiz
- Claude 3.5 Sonnet ile içgörüler
- Prompt engineering
- Fallback mekanizmaları

#### 🔍 Analysis Service (`analysis_service.py`)
**Amaç**: Metin analizi ve metrik hesaplamaları
- NLP ile duygu analizi
- İlişki metrikleri hesaplama
- Empati, çatışma, biz-dili skorları
- Veri agregasyonu

#### 📧 Email Service (`email_service.py`)
**Amaç**: Email gönderimi
- Email doğrulama
- Şifre sıfırlama
- Bildirimler

#### 💳 Payment Service (`payment.py`)
**Amaç**: Ödeme işlemleri
- Stripe entegrasyonu
- Abonelik yönetimi
- Webhook işleme

### Database Models

**User Model**:
```python
- id: UUID (PK)
- email: String (unique)
- hashed_password: String
- is_active: Boolean
- is_verified: Boolean
- subscription_tier: String
- created_at: DateTime
```

**Analysis Model**:
```python
- id: UUID (PK)
- user_id: UUID (FK)
- text_content: Text
- metrics: JSON
- insights: JSON
- created_at: DateTime
```

**Message Model**:
```python
- id: UUID (PK)
- user_id: UUID (FK)
- role: String (user/assistant)
- content: Text
- created_at: DateTime
```

## 🎨 Frontend Yapısı

### Dizin Ağacı

```
frontend/
├── app/                  # Next.js 15 App Router
│   ├── page.tsx          # Ana sayfa / Landing
│   ├── layout.tsx        # Root layout
│   ├── providers.tsx     # Context providers
│   ├── auth/
│   │   └── page.tsx      # Login/Register sayfası
│   ├── dashboard/
│   │   └── page.tsx      # Dashboard sayfası
│   ├── chat/
│   │   └── page.tsx      # AI Chat sayfası
│   ├── advanced/
│   │   └── page.tsx      # Gelişmiş özellikler
│   ├── subscription/
│   │   └── page.tsx      # Abonelik yönetimi
│   └── verify-email/
│       └── page.tsx      # Email doğrulama
│
├── components/           # React Components
│   ├── screens/          # Ana ekran komponentleri
│   │   ├── WelcomeScreen.tsx
│   │   ├── AuthScreen.tsx
│   │   ├── DashboardScreen.tsx
│   │   ├── AnalysisScreen.tsx
│   │   ├── ChatScreen.tsx
│   │   ├── InsightsScreen.tsx
│   │   └── SubscriptionScreen.tsx
│   │
│   ├── widgets/          # Widget komponentleri
│   │   ├── DailyPulse.tsx
│   │   ├── WeeklyScoreCard.tsx
│   │   ├── LoveLanguageWidget.tsx
│   │   ├── ConflictResolutionWidget.tsx
│   │   ├── CoachingWidget.tsx
│   │   ├── GoalsWidget.tsx
│   │   ├── ConversationStartersWidget.tsx
│   │   └── DateIdeasWidget.tsx
│   │
│   ├── charts/           # Grafik komponentleri
│   │   ├── TrendChart.tsx
│   │   ├── MetricRadarChart.tsx
│   │   └── OutcomeCharts.tsx
│   │
│   ├── ui/               # Temel UI bileşenleri
│   │   ├── Toast.tsx
│   │   ├── SkeletonLoader.tsx
│   │   ├── DarkModeToggle.tsx
│   │   └── MobileNav.tsx
│   │
│   └── shared/           # Paylaşılan komponentler
│       ├── AnalysisForm.tsx
│       ├── AnalysisResult.tsx
│       ├── FileUploadScreen.tsx
│       ├── ProcessingScreen.tsx
│       └── ProgressTracker.tsx
│
├── lib/                  # Utility Functions
│   ├── api.ts            # API client
│   ├── auth.ts           # Auth helpers
│   └── utils.ts          # Genel yardımcılar
│
├── hooks/                # Custom React Hooks
│   └── useAuth.ts        # Auth hook
│
├── contexts/             # React Contexts
│   └── AuthContext.tsx   # Auth context
│
├── types/                # TypeScript Definitions
│   └── index.d.ts        # Type tanımları
│
├── electron/             # Electron Desktop App
│   ├── main.ts           # Electron main process
│   ├── preload.ts        # Preload script
│   └── backend-manager.ts # Backend otomatik başlatma
│
└── public/               # Static Assets
    ├── icons/
    └── images/
```

### Component Hiyerarşisi

```mermaid
graph TB
    A[app/layout.tsx] --> B[Providers]
    B --> C[app/page.tsx]
    B --> D[app/dashboard/page.tsx]
    D --> E[DashboardScreen]
    E --> F1[DailyPulse]
    E --> F2[WeeklyScoreCard]
    E --> F3[InsightsScreen]
    E --> F4[Charts]
    F4 --> G1[TrendChart]
    F4 --> G2[MetricRadarChart]
```

### Ekranlar ve Sorumlulukları

#### 🏠 WelcomeScreen
**Amaç**: İlk karşılama ekranı
- Uygulama tanıtımı
- Özellik vurguları
- "Başla" butonu

#### 🔐 AuthScreen
**Amaç**: Kimlik doğrulama
- Login formu
- Kayıt formu
- Email doğrulama

#### 📊 DashboardScreen
**Amaç**: Ana kontrol paneli
- Metrik özeti
- Günlük pulse widget
- Haftalık skorlar
- Trend grafikleri
- Hızlı aksiyonlar

#### 💬 ChatScreen
**Amaç**: AI ile sohbet
- Mesaj geçmişi
- Real-time yanıtlar
- Context-aware öneriler

#### 📈 InsightsScreen
**Amaç**: Derinlemesine içgörüler
- AI-generated insights
- İlişki metrikleri detayları
- Öneriler ve action items

#### 🎯 AnalysisScreen
**Amaç**: Analiz başlatma
- Metin girişi
- WhatsApp import
- Ses yükleme
- Analiz türü seçimi

### State Management

**Auth Context**: Global authentication state
```typescript
{
  user: User | null
  token: string | null
  login: (email, password) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}
```

**API Client**: Axios-based API wrapper
```typescript
api.auth.login()
api.analysis.create()
api.chat.send()
```

### Electron Integration

**Backend Manager**: Backend'i otomatik başlatır
- Python server'ı arka planda çalıştırır
- Port yönetimi
- Graceful shutdown

**Main Process**: Electron ana süreci
- Pencere yönetimi
- IPC communication
- System tray entegrasyonu

## 🧠 ML (Machine Learning) Yapısı

```
ml/
├── preprocessing/        # Metin ön işleme
│   ├── turkish_nlp.py    # Türkçe NLP işlemleri
│   └── text_cleaner.py   # Metin temizleme
│
├── features/             # Özellik çıkarımı
│   ├── sentiment.py      # Duygu analizi
│   ├── empathy.py        # Empati tespiti
│   └── conflict.py       # Çatışma analizi
│
├── models/               # Eğitilmiş modeller
│   └── .gitkeep
│
└── evaluation/           # Metrik hesaplama
    └── metrics.py        # İlişki metrikleri
```

## 📝 Test Yapısı

```
tests/
├── test_api/             # API testleri
│   ├── test_auth.py
│   ├── test_analysis.py
│   └── test_chat.py
│
├── test_services/        # Servis testleri
│   ├── test_ai_service.py
│   └── test_analysis_service.py
│
└── conftest.py           # Pytest fixtures
```

## 🔄 Veri Akışı

### Analiz Akışı

```mermaid
sequenceDiagram
    participant U as User (Frontend)
    participant API as FastAPI
    participant A as Analysis Service
    participant AI as AI Service
    participant DB as Database

    U->>API: POST /analysis/text
    API->>A: analyze_text()
    A->>AI: get_ai_insight()
    AI-->>A: AI response
    A->>DB: save_analysis()
    DB-->>A: analysis_id
    A-->>API: AnalysisResult
    API-->>U: JSON response
```

### Authentication Akışı

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant API as Backend API
    participant DB as Database

    U->>F: Login form gönder
    F->>API: POST /auth/login
    API->>DB: Kullanıcı kontrol
    DB-->>API: User data
    API->>API: JWT token oluştur
    API-->>F: {token, user}
    F->>F: Token'ı localStorage'a kaydet
    F->>F: AuthContext güncelle
    F-->>U: Dashboard'a yönlendir
```

## 🗂️ Dosya İsimlendirme Kuralları

### Python (Backend)
- **Dosyalar**: snake_case (örn: `analysis_service.py`)
- **Sınıflar**: PascalCase (örn: `AnalysisService`)
- **Fonksiyonlar**: snake_case (örn: `analyze_text`)
- **Sabitler**: UPPER_SNAKE_CASE (örn: `MAX_TEXT_LENGTH`)

### TypeScript (Frontend)
- **Dosyalar**: PascalCase komponentler (örn: `DashboardScreen.tsx`)
- **Utility dosyalar**: camelCase (örn: `api.ts`)
- **Komponentler**: PascalCase (örn: `AnalysisResult`)
- **Fonksiyonlar**: camelCase (örn: `fetchAnalysis`)
- **Sabitler**: UPPER_SNAKE_CASE (örn: `API_BASE_URL`)

## 🔑 Environment Variables

### Backend `.env`
```bash
# Database
DATABASE_URL=sqlite:///./iliski_analiz.db
# DATABASE_URL=postgresql://user:pass@localhost:5432/dbname

# Security
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# AI APIs
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### Frontend `.env.local`
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 📦 Bağımlılıklar

### Backend Ana Bağımlılıklar
- **FastAPI**: Web framework
- **SQLAlchemy**: ORM
- **Pydantic**: Data validation
- **OpenAI SDK**: GPT API
- **Anthropic SDK**: Claude API
- **Spacy**: NLP işlemleri
- **Alembic**: Database migrations
- **python-jose**: JWT tokens

### Frontend Ana Bağımlılıklar
- **Next.js 15**: React framework
- **React 19**: UI library
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **Electron**: Desktop app
- **Recharts**: Grafik görselleştirme
- **Framer Motion**: Animasyonlar
- **Axios**: HTTP client

## 🚀 Build ve Deployment

### Backend Build
```bash
# Development
uvicorn backend.app.main:app --reload --port 8000

# Production
gunicorn backend.app.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

### Frontend Build
```bash
# Development
npm run dev

# Production web
npm run build
npm start

# Desktop app
npm run electron-build
```

## 📚 İlgili Dokümantasyon

- [DEVELOPER_GUIDE.md](file:///Users/hakkiyuvanc/GİTHUB/relationship-ai/ili-kiyapayzekauygulamas-/DEVELOPER_GUIDE.md) - Geliştirici kılavuzu
- [backend/README.md](file:///Users/hakkiyuvanc/GİTHUB/relationship-ai/ili-kiyapayzekauygulamas-/backend/README.md) - Backend dokümantasyonu
- [frontend/README.md](file:///Users/hakkiyuvanc/GİTHUB/relationship-ai/ili-kiyapayzekauygulamas-/frontend/README.md) - Frontend dokümantasyonu
- [API.md](file:///Users/hakkiyuvanc/GİTHUB/relationship-ai/ili-kiyapayzekauygulamas-/API.md) - API referansı
- [QUICKSTART.md](file:///Users/hakkiyuvanc/GİTHUB/relationship-ai/ili-kiyapayzekauygulamas-/QUICKSTART.md) - Hızlı başlangıç

---

**Son Güncelleme**: 29 Aralık 2025
