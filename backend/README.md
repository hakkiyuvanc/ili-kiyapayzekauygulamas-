# Backend - FastAPI Server

> İlişki Analiz AI Backend API Dokümantasyonu

## 📋 Genel Bakış

Bu backend, AI destekli ilişki analizi ve iletişim değerlendirme hizmeti sunan RESTful API'dir.

### Teknoloji Stack

- **Framework**: FastAPI 0.104+
- **ORM**: SQLAlchemy 2.0+
- **Database**: PostgreSQL / SQLite
- **AI**: OpenAI GPT-4o-mini, Anthropic Claude 3.5 Sonnet
- **NLP**: Spacy (Türkçe dil modeli)
- **Auth**: JWT (python-jose)
- **Validation**: Pydantic v2

## 🏗️ Mimari

```
backend/
├── app/
│   ├── api/              # API Route Handlers
│   ├── core/             # Core Utilities (config, security, db)
│   ├── models/           # SQLAlchemy Models
│   ├── schemas/          # Pydantic Schemas
│   ├── services/         # Business Logic Layer
│   └── main.py           # FastAPI Application
├── alembic/              # Database Migrations
└── tests/                # Test Suite
```

### Katman Sorumlulukları

**API Layer** (`api/`): HTTP isteklerini karşılar, request validation, response serialization
**Service Layer** (`services/`): İş mantığı, AI entegrasyonu, veri işleme
**Model Layer** (`models/`): Database şemaları, ORM modelleri
**Schema Layer** (`schemas/`): Pydantic modelleri, data validation

## 🔌 API Endpoints

### Authentication

#### POST `/api/auth/register`
Yeni kullanıcı kaydı.

**Request**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "full_name": "Ahmet Yılmaz"
}
```

**Response**:
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "Ahmet Yılmaz",
  "is_verified": false,
  "created_at": "2025-12-29T12:00:00Z"
}
```

#### POST `/api/auth/login`
Kullanıcı girişi.

**Request**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "Ahmet Yılmaz"
  }
}
```

### Analysis

#### POST `/api/analysis/text`
Metin analizi başlat.

**Headers**: `Authorization: Bearer <token>`

**Request**:
```json
{
  "text": "Merhaba sevgilim, bugün nasıl geçti günün? Ben seni çok özledim...",
  "analysis_type": "conversation",
  "use_ai": true
}
```

**Response**:
```json
{
  "id": "uuid",
  "status": "completed",
  "metrics": {
    "empathy_score": 0.85,
    "sentiment_score": 0.72,
    "conflict_score": 0.15,
    "we_language_score": 0.45,
    "balance_score": 0.68
  },
  "insights": {
    "summary": "İletişiminizde yüksek empati ve pozitif ton gözlemlendi...",
    "strengths": ["Empati", "Pozitif ton"],
    "areas_for_improvement": ["Ortak dil kullanımı"],
    "recommendations": [
      "Daha fazla 'biz' dilini kullanmayı deneyin",
      "Partnerinizin duygularını daha fazla yansıtın"
    ]
  },
  "created_at": "2025-12-29T12:00:00Z"
}
```

#### GET `/api/analysis/{analysis_id}`
Analiz sonucunu getir.

**Response**: Yukarıdakiyle aynı format.

#### GET `/api/analysis/history`
Kullanıcının analiz geçmişi.

**Query Parameters**:
- `skip`: int = 0
- `limit`: int = 20
- `sort_by`: str = "created_at"

**Response**:
```json
{
  "total": 42,
  "items": [
    {
      "id": "uuid",
      "created_at": "2025-12-29T12:00:00Z",
      "metrics": {...},
      "insights": {...}
    }
  ]
}
```

### Chat

#### POST `/api/chat/send`
AI ile sohbet.

**Request**:
```json
{
  "message": "İlişkimde daha iyi iletişim kurmak için ne yapabilirim?",
  "context": "relationship_advice"
}
```

**Response**:
```json
{
  "id": "uuid",
  "role": "assistant",
  "content": "İlişkinizde daha iyi iletişim kurmanız için...",
  "created_at": "2025-12-29T12:00:00Z"
}
```

### Daily Pulse

#### POST `/api/daily/checkup`
Günlük durum check-in.

**Request**:
```json
{
  "mood": "good",
  "relationship_quality": 8,
  "notes": "Bugün harika bir gün geçirdik"
}
```

**Response**:
```json
{
  "id": "uuid",
  "streak_days": 7,
  "insights": "7 gündür düzenli check-in yapıyorsunuz!",
  "created_at": "2025-12-29T12:00:00Z"
}
```

## 🧩 Servisler

### AIService (`services/ai_service.py`)

AI provider entegrasyonları.

**Metodlar**:
```python
async def get_analysis_insight(
    text: str,
    metrics: dict,
    provider: str = "openai"
) -> dict:
    """
    AI'dan analiz içgörüleri alır.
    
    Args:
        text: Analiz edilen metin
        metrics: Hesaplanan metrikler
        provider: "openai" veya "anthropic"
    
    Returns:
        AI-generated insights
    """
```

**AI Providers**:
- **OpenAI GPT-4o-mini**: Hızlı, uygun fiyatlı
- **Anthropic Claude 3.5 Sonnet**: Daha derinlemesine analiz
- **Fallback**: Rule-based sistem (AI olmadan da çalışır)

### AnalysisService (`services/analysis_service.py`)

Metin analizi ve metrik hesaplamaları.

**Metodlar**:
```python
async def analyze_text(
    text: str,
    user_id: str,
    use_ai: bool = True
) -> AnalysisResult:
    """
    Metin analizi yapar.
    
    Pipeline:
    1. Metin ön işleme (temizleme, normalizasyon)
    2. NLP analizi (spacy)
    3. Metrik hesaplama
    4. AI insight generation (opsiyonel)
    5. Sonuçları kaydet
    """
```

**Metrikler**:
- **Empati Skoru**: Empati ifadelerinin yoğunluğu (0-1)
- **Duygu Skoru**: Genel duygu tonu (pozitif: 0-1, negatif: -1-0)
- **Çatışma Skoru**: Çatışma belirten ifadeler (0-1)
- **Biz-Dili Skoru**: "Biz" zamiri kullanım yoğunluğu (0-1)
- **Denge Skoru**: İletişim dengesi (0-1)

### CRUDService (`services/crud.py`)

Database CRUD işlemleri.

**Metodlar**:
```python
async def get_user(db: Session, user_id: str) -> User
async def create_user(db: Session, user: UserCreate) -> User
async def update_user(db: Session, user_id: str, updates: dict) -> User
async def delete_user(db: Session, user_id: str) -> bool

async def get_analysis(db: Session, analysis_id: str) -> Analysis
async def create_analysis(db: Session, analysis: AnalysisCreate) -> Analysis
async def get_user_analyses(db: Session, user_id: str, skip: int, limit: int) -> List[Analysis]
```

### EmailService (`services/email_service.py`)

Email gönderimi.

**Metodlar**:
```python
async def send_verification_email(email: str, token: str) -> bool
async def send_password_reset_email(email: str, token: str) -> bool
async def send_notification(email: str, subject: str, body: str) -> bool
```

## 🗄️ Database Modelleri

### User Model

```python
class User(Base):
    __tablename__ = "users"
    
    id: UUID (PK)
    email: String (unique, indexed)
    hashed_password: String
    full_name: String | None
    is_active: Boolean = True
    is_verified: Boolean = False
    subscription_tier: String = "free"  # free, pro, premium
    created_at: DateTime
    updated_at: DateTime
    
    # Relations
    analyses: relationship("Analysis", back_populates="user")
    messages: relationship("Message", back_populates="user")
```

### Analysis Model

```python
class Analysis(Base):
    __tablename__ = "analyses"
    
    id: UUID (PK)
    user_id: UUID (FK -> users.id)
    text_content: Text
    analysis_type: String  # conversation, message, general
    
    # Metrics (JSON)
    metrics: JSON = {
        "empathy_score": float,
        "sentiment_score": float,
        "conflict_score": float,
        "we_language_score": float,
        "balance_score": float
    }
    
    # AI Insights (JSON)
    insights: JSON = {
        "summary": str,
        "strengths": List[str],
        "areas_for_improvement": List[str],
        "recommendations": List[str]
    }
    
    status: String  # pending, processing, completed, failed
    created_at: DateTime
    
    # Relations
    user: relationship("User", back_populates="analyses")
```

### Message Model (Chat)

```python
class Message(Base):
    __tablename__ = "messages"
    
    id: UUID (PK)
    user_id: UUID (FK -> users.id)
    role: String  # user, assistant
    content: Text
    context: String | None  # relationship_advice, conflict_resolution, etc.
    created_at: DateTime
    
    # Relations
    user: relationship("User", back_populates="messages")
```

## 🔒 Security

### Authentication Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant API as API
    participant Auth as Security Module
    participant DB as Database

    C->>API: POST /auth/login
    API->>DB: Fetch user by email
    DB-->>API: User data
    API->>Auth: verify_password()
    Auth-->>API: Password valid
    API->>Auth: create_access_token()
    Auth-->>API: JWT token
    API-->>C: {token, user}
    
    Note over C: Store token in localStorage
    
    C->>API: GET /api/analysis (+ Bearer token)
    API->>Auth: decode_token()
    Auth-->>API: User ID
    API->>DB: Fetch data for user
    DB-->>API: Data
    API-->>C: Response
```

### Password Hashing

**Argon2** kullanıyoruz (bcrypt'ten daha güvenli):

```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)
```

### JWT Tokens

```python
from jose import jwt
from datetime import datetime, timedelta

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=30))
    to_encode.update({"exp": expire})
    
    encoded_jwt = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm="HS256"
    )
    return encoded_jwt
```

## ⚙️ Konfigürasyon

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/iliski_analiz_ai
# veya
DATABASE_URL=sqlite:///./iliski_analiz.db

# Security
SECRET_KEY=your-super-secret-key-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# AI APIs
OPENAI_API_KEY=sk-proj-...
ANTHROPIC_API_KEY=sk-ant-...

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Rate Limiting
RATE_LIMIT_PER_MINUTE=60
RATE_LIMIT_PER_HOUR=1000

# CORS
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com
```

### Config Class

```python
# app/core/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "İlişki Analiz AI"
    debug: bool = False
    
    database_url: str
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    openai_api_key: str | None = None
    anthropic_api_key: str | None = None
    
    class Config:
        env_file = ".env"

settings = Settings()
```

## 🚀 Çalıştırma

### Development

```bash
# Virtual environment aktif et
source venv/bin/activate

# Database migration
alembic upgrade head

# Server başlat (auto-reload)
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

# Veya direkt Python ile
python -m uvicorn app.main:app --reload
```

### Production

```bash
# Gunicorn ile (multi-worker)
gunicorn app.main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000 \
  --access-logfile - \
  --error-logfile -
```

### Docker

```bash
# Build
docker build -t iliski-analiz-backend .

# Run
docker run -p 8000:8000 --env-file .env iliski-analiz-backend
```

## 🧪 Testing

```bash
# Tüm testleri çalıştır
pytest

# Verbose output
pytest -v

# Belirli dosya
pytest tests/test_api/test_auth.py

# Coverage
pytest --cov=app --cov-report=html
open htmlcov/index.html
```

## 📊 API Dokümantasyonu

Server çalışırken:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

## 🔧 Troubleshooting

### Database Connection Error

```bash
# PostgreSQL çalışıyor mu kontrol et
pg_isready -h localhost -p 5432

# Database var mı kontrol et
psql -l | grep iliski_analiz

# Migration'ları sıfırla
alembic downgrade base
alembic upgrade head
```

### Import Errors

```bash
# Dependencies yeniden yükle
pip install -e ".[dev]"

# Spacy model
python -m spacy download tr_core_news_lg
```

### AI API Errors

```python
# Fallback sistemi devrede
# AI API yoksa bile çalışır (rule-based)

# .env dosyasını kontrol et
cat .env | grep API_KEY
```

## 📚 İlgili Dokümantasyon

- [Ana README](file:///Users/hakkiyuvanc/GİTHUB/relationship-ai/ili-kiyapayzekauygulamas-/README.md)
- [CODE_STRUCTURE.md](file:///Users/hakkiyuvanc/GİTHUB/relationship-ai/ili-kiyapayzekauygulamas-/CODE_STRUCTURE.md)
- [DEVELOPER_GUIDE.md](file:///Users/hakkiyuvanc/GİTHUB/relationship-ai/ili-kiyapayzekauygulamas-/DEVELOPER_GUIDE.md)
- [API.md](file:///Users/hakkiyuvanc/GİTHUB/relationship-ai/ili-kiyapayzekauygulamas-/API.md)

---

**Son Güncelleme**: 29 Aralık 2025
