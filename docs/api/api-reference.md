# API Documentation

## Base URL

- **Development:** `http://localhost:8000`
- **Production:** `https://api.iliskianaliz.ai`

## Authentication

Most endpoints require authentication using JWT Bearer tokens.

### Get Token

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "user@example.com",
  "password": "your_password"
}
```

**Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "expires_in": 604800
}
```

### Use Token

```http
GET /api/analysis/history
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

## Endpoints

### Health Check

#### GET /health

Check if API is running.

**Response:**
```json
{
  "status": "healthy",
  "service": "iliski-analiz-ai",
  "version": "0.1.0"
}
```

---

### Authentication

#### POST /api/auth/register

Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "StrongPassword123"
}
```

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "username",
  "created_at": "2025-12-11T10:00:00Z"
}
```

#### POST /api/auth/login

Login and get access token.

**Request Body:**
```json
{
  "username": "user@example.com",
  "password": "StrongPassword123"
}
```

**Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "expires_in": 604800
}
```

#### POST /api/auth/refresh

Refresh access token.

**Headers:**
```
Authorization: Bearer {refresh_token}
```

**Response:**
```json
{
  "access_token": "new_token_here",
  "token_type": "bearer",
  "expires_in": 604800
}
```

---

### Analysis

#### POST /api/analysis/analyze

Analyze conversation text.

**Request Body:**
```json
{
  "text": "Ali: Merhaba canım, nasılsın?\nAyşe: İyiyim aşkım, sen nasılsın?\nAli: Ben de iyiyim, seni özledim",
  "format_type": "simple",
  "privacy_mode": true
}
```

**Parameters:**
- `text` (required): Conversation text
- `format_type` (optional): "simple" | "whatsapp" (default: "simple")
- `privacy_mode` (optional): Boolean (default: true)

**Response:**
```json
{
  "overall_score": 8.5,
  "summary": "İlişkinizde genel olarak pozitif bir iletişim hakim...",
  "metrics": {
    "sentiment": {
      "score": 9.0,
      "label": "Çok Olumlu",
      "details": {
        "positive_ratio": 0.85,
        "negative_ratio": 0.05,
        "neutral_ratio": 0.10
      }
    },
    "empathy": {
      "score": 8.5,
      "label": "Yüksek",
      "details": {
        "empathy_words": 12,
        "total_words": 150
      }
    },
    "conflict": {
      "score": 1.2,
      "label": "Çok Düşük",
      "details": {
        "conflict_indicators": 1,
        "total_messages": 50
      }
    },
    "we_language": {
      "score": 7.8,
      "label": "İyi",
      "details": {
        "we_pronouns": 8,
        "i_pronouns": 12
      }
    },
    "communication_balance": {
      "score": 8.9,
      "label": "Dengeli",
      "details": {
        "person1_messages": 25,
        "person2_messages": 25,
        "balance_ratio": 1.0
      }
    }
  },
  "insights": [
    {
      "category": "Güçlü Yön",
      "title": "Olumlu İletişim",
      "description": "Konuşmalarınızda yüksek oranda olumlu ifadeler kullanıyorsunuz",
      "icon": "heart"
    },
    {
      "category": "Dikkat Noktası",
      "title": "Empati Gösterme",
      "description": "Daha fazla empati ifadesi kullanmaya özen gösterin",
      "icon": "alert"
    }
  ],
  "recommendations": [
    {
      "priority": "high",
      "title": "Günlük Check-in",
      "description": "Her gün 10 dakika kaliteli konuşma zamanı ayırın",
      "exercise": "Akşam yemeğinde birbirinize günün en iyi anını sorun"
    },
    {
      "priority": "medium",
      "title": "Empati Pratiği",
      "description": "Partnerinizin duygularını daha çok yansıtmaya çalışın",
      "exercise": "Dinlerken 'Anladım, sen...' gibi ifadeler kullanın"
    }
  ],
  "analysis_id": 123
}
```

#### GET /api/analysis/history

Get user's analysis history.

**Query Parameters:**
- `skip` (optional): Number of records to skip (default: 0)
- `limit` (optional): Number of records to return (default: 10, max: 100)

**Response:**
```json
{
  "total": 45,
  "items": [
    {
      "id": 123,
      "overall_score": 8.5,
      "created_at": "2025-12-11T10:00:00Z",
      "summary": "İlişkinizde genel olarak pozitif..."
    },
    ...
  ]
}
```

#### GET /api/analysis/history/{id}

Get specific analysis details.

**Path Parameters:**
- `id`: Analysis ID

**Response:**
```json
{
  "id": 123,
  "overall_score": 8.5,
  "summary": "...",
  "metrics": {...},
  "insights": [...],
  "recommendations": [...],
  "created_at": "2025-12-11T10:00:00Z"
}
```

#### GET /api/analysis/metrics/{id}

Get detailed metrics for an analysis.

**Path Parameters:**
- `id`: Analysis ID

**Response:**
```json
{
  "sentiment": {...},
  "empathy": {...},
  "conflict": {...},
  "we_language": {...},
  "communication_balance": {...}
}
```

#### POST /api/analysis/feedback

Submit feedback for an analysis.

**Request Body:**
```json
{
  "analysis_id": 123,
  "rating": 5,
  "comment": "Çok faydalı oldu, teşekkürler!",
  "helpful": true
}
```

**Response:**
```json
{
  "id": 456,
  "analysis_id": 123,
  "rating": 5,
  "created_at": "2025-12-11T10:00:00Z"
}
```

---

### File Upload

#### POST /api/upload/upload

Upload and preview a file (without analysis).

**Request:**
```
Content-Type: multipart/form-data

file: (binary file data)
```

**Response:**
```json
{
  "filename": "chat_export.txt",
  "size": 15234,
  "format": "whatsapp",
  "preview": {
    "message_count": 150,
    "participant_count": 2,
    "date_range": {
      "start": "2025-01-01",
      "end": "2025-12-11"
    }
  }
}
```

#### POST /api/upload/upload-and-analyze

Upload file and perform analysis.

**Request:**
```
Content-Type: multipart/form-data

file: (binary file data)
privacy_mode: true
save_to_db: true
```

**Query Parameters:**
- `privacy_mode` (optional): Boolean (default: true)
- `save_to_db` (optional): Boolean (default: false)

**Response:**
```json
{
  "analysis": {
    "overall_score": 8.5,
    "metrics": {...},
    "insights": [...],
    "recommendations": [...]
  },
  "file_info": {
    "filename": "chat_export.txt",
    "size": 15234,
    "format": "whatsapp"
  }
}
```

#### GET /api/upload/supported-formats

Get list of supported file formats.

**Response:**
```json
{
  "formats": [
    {
      "extension": ".txt",
      "mime_type": "text/plain",
      "description": "Plain text file"
    },
    {
      "extension": ".json",
      "mime_type": "application/json",
      "description": "JSON file"
    },
    {
      "extension": ".zip",
      "mime_type": "application/zip",
      "description": "WhatsApp ZIP export"
    }
  ],
  "max_size_mb": 10
}
```

---

## Error Responses

### Standard Error Format

```json
{
  "detail": "Error message here"
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `422` - Validation Error
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

### Validation Error Example

```json
{
  "detail": [
    {
      "loc": ["body", "text"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

---

## Rate Limiting

API requests are rate-limited:

- **Analysis endpoints:** 10 requests/minute
- **Upload endpoints:** 5 requests/minute
- **Auth endpoints:** 20 requests/hour
- **General endpoints:** 100 requests/hour

Rate limit headers:
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 9
X-RateLimit-Reset: 1639392000
```

---

## Pagination

List endpoints support pagination:

```http
GET /api/analysis/history?skip=20&limit=10
```

**Response includes:**
```json
{
  "total": 45,
  "skip": 20,
  "limit": 10,
  "items": [...]
}
```

---

## Interactive Documentation

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

---

## SDKs and Examples

### Python Example

```python
import requests

# Login
response = requests.post(
    'http://localhost:8000/api/auth/login',
    json={'username': 'user@example.com', 'password': 'pass'}
)
token = response.json()['access_token']

# Analyze text
headers = {'Authorization': f'Bearer {token}'}
response = requests.post(
    'http://localhost:8000/api/analysis/analyze',
    headers=headers,
    json={
        'text': 'Ali: Merhaba\nAyşe: Merhaba',
        'privacy_mode': True
    }
)
result = response.json()
print(f"Score: {result['overall_score']}")
```

### JavaScript Example

```javascript
// Login
const loginResponse = await fetch('http://localhost:8000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'user@example.com',
    password: 'pass'
  })
});
const { access_token } = await loginResponse.json();

// Analyze text
const analysisResponse = await fetch('http://localhost:8000/api/analysis/analyze', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${access_token}`
  },
  body: JSON.stringify({
    text: 'Ali: Merhaba\nAyşe: Merhaba',
    privacy_mode: true
  })
});
const result = await analysisResponse.json();
console.log(`Score: ${result.overall_score}`);
```

### cURL Examples

```bash
# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user@example.com","password":"pass"}'

# Analyze
curl -X POST http://localhost:8000/api/analysis/analyze \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "text": "Ali: Merhaba\nAyşe: Merhaba",
    "privacy_mode": true
  }'

# Upload file
curl -X POST http://localhost:8000/api/upload/upload-and-analyze \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@chat.txt" \
  -F "privacy_mode=true"
```

---

## Support

- **Email:** api@iliskianaliz.ai
- **Issues:** https://github.com/hakkiyuvanc/ili-kiyapayzekauygulamas-/issues
# API Documentation

## İlişki Analiz AI - API Referansı

Backend API'si FastAPI ile geliştirilmiştir ve RESTful prensiplere uyar.

### Base URL
```
http://localhost:8000
```

### API Dokümantasyonu
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

---

## Authentication

### Register
Yeni kullanıcı kaydı.

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "full_name": "Ali Yılmaz"
}
```

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "full_name": "Ali Yılmaz",
  "is_active": true,
  "created_at": "2024-12-25T10:30:00"
}
```

### Login
Kullanıcı girişi (JWT token alımı).

**Endpoint:** `POST /api/auth/login`

**Request Body (form-data):**
```
username: user@example.com
password: securePassword123
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### Get Current User
Giriş yapmış kullanıcı bilgisi.

**Endpoint:** `GET /api/auth/me`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "full_name": "Ali Yılmaz",
  "is_active": true,
  "created_at": "2024-12-25T10:30:00"
}
```

---

## Analysis

### Analyze Text
Metin analizi yap.

**Endpoint:** `POST /api/analysis/analyze`

**Request Body:**
```json
{
  "text": "Ali: Merhaba nasılsın?\nAyşe: İyiyim teşekkürler",
  "format_type": "simple",
  "privacy_mode": true
}
```

**Query Parameters:**
- `save_to_db` (boolean): Veritabanına kaydet (default: false)

**Response:**
```json
{
  "analysis_id": 123,
  "overall_score": 7.5,
  "metrics": {
    "sentiment": {
      "score": 75.0,
      "label": "Olumlu"
    },
    "empathy": {
      "score": 60.0,
      "label": "Orta"
    }
  },
  "summary": "İletişiminiz genel olarak pozitif...",
  "insights": [
    {
      "type": "positive",
      "title": "Güçlü Yönler",
      "description": "..."
    }
  ],
  "recommendations": [
    {
      "priority": "high",
      "title": "Öneriler",
      "description": "..."
    }
  ]
}
```

### Quick Score
Hızlı puan hesaplama (detaysız).

**Endpoint:** `POST /api/analysis/quick-score`

**Request Body:**
```json
{
  "text": "Metin içeriği..."
}
```

**Response:**
```json
{
  "overall_score": 7.5,
  "sentiment_score": 75.0,
  "empathy_score": 60.0,
  "conflict_score": 20.0,
  "we_language_score": 40.0,
  "balance_score": 90.0
}
```

### Get Analysis History
Kullanıcı analiz geçmişi.

**Endpoint:** `GET /api/analysis/history`

**Query Parameters:**
- `skip` (int): Kaç kayıt atlanacak (default: 0)
- `limit` (int): Kaç kayıt getirilecek (default: 10, max: 100)

**Response:**
```json
{
  "total": 15,
  "items": [
    {
      "id": 123,
      "overall_score": 7.5,
      "format_type": "simple",
      "created_at": "2024-12-25T10:30:00"
    }
  ]
}
```

### Get Analysis Details
Tek bir analiz detayı.

**Endpoint:** `GET /api/analysis/history/{analysis_id}`

**Response:**
```json
{
  "id": 123,
  "overall_score": 7.5,
  "metrics": { ... },
  "full_report": { ... },
  "created_at": "2024-12-25T10:30:00"
}
```

### Delete Analysis
Analiz sil.

**Endpoint:** `DELETE /api/analysis/history/{analysis_id}`

**Response:**
```json
{
  "message": "Analiz başarıyla silindi",
  "deleted_id": 123
}
```

---

## File Upload

### Upload File (Preview)
Dosya yükle ve önizle.

**Endpoint:** `POST /api/upload/upload`

**Request:**
- Content-Type: `multipart/form-data`
- Field: `file` (file)

**Response:**
```json
{
  "filename": "conversation.txt",
  "size": 1024,
  "format_detected": "whatsapp",
  "message_count": 50,
  "text_preview": "25/12/2024, 14:30 - Ali: Merhaba...",
  "status": "success"
}
```

### Upload and Analyze
Dosya yükle ve direkt analiz et.

**Endpoint:** `POST /api/upload/upload-and-analyze`

**Request:**
- Content-Type: `multipart/form-data`
- Field: `file` (file)

**Query Parameters:**
- `privacy_mode` (boolean): PII maskeleme (default: true)
- `save_to_db` (boolean): DB'ye kaydet (default: true)

**Response:**
```json
{
  "analysis_id": 123,
  "filename": "conversation.txt",
  "overall_score": 7.5,
  "metrics": { ... },
  "summary": "...",
  "insights": [ ... ],
  "recommendations": [ ... ]
}
```

### Supported Formats
Desteklenen dosya formatları.

**Endpoint:** `GET /api/upload/supported-formats`

**Response:**
```json
{
  "formats": [
    {
      "extension": ".txt",
      "name": "Text File",
      "description": "WhatsApp export veya düz metin",
      "max_size_mb": 10
    }
  ],
  "max_size_mb": 10,
  "notes": [
    "Dosyalar UTF-8 encoding ile yüklenmelidir"
  ]
}
```

---

## Conversation Formats

### Simple Format
```
Ali: Merhaba nasılsın?
Ayşe: İyiyim teşekkürler
Ali: Ne yapıyorsun?
```

### WhatsApp Format (Android)
```
25/12/2024, 14:30 - Ali: Merhaba nasılsın?
25/12/2024, 14:31 - Ayşe: İyiyim teşekkürler
```

### WhatsApp Format (iOS)
```
[25/12/2024, 14:30:00] Ali: Merhaba nasılsın?
[25/12/2024, 14:31:00] Ayşe: İyiyim teşekkürler
```

---

## Error Codes

| Status Code | Açıklama |
|-------------|----------|
| 200 | Başarılı |
| 400 | Geçersiz istek |
| 401 | Yetkisiz (token geçersiz) |
| 404 | Bulunamadı |
| 413 | Dosya çok büyük |
| 422 | Validasyon hatası |
| 500 | Sunucu hatası |

---

## Rate Limiting

Şu anda rate limiting aktif değil ancak production için önerilir:
- Analiz endpoint'i: 10 istek/dakika
- Dosya upload: 5 istek/dakika
- Auth endpoint'leri: 5 istek/dakika

---

## Privacy & Security

### PII Maskeleme
`privacy_mode=true` olduğunda:
- Telefon numaraları: `0532 XXX XX XX`
- Email adresleri: `user@*****.com`
- İsimler: Korunur (analiz için gerekli)

### Token Security
- JWT tokens 7 gün geçerli
- Token'lar `HS256` algoritması ile imzalanır
- Password'ler bcrypt ile hash'lenir

### CORS
Default olarak tüm origin'lere izin verilir. Production'da kısıtlanmalı:
```python
CORS_ORIGINS=["https://yourdomain.com"]
```

---

## Example Usage

### Python
```python
import requests

# Login
response = requests.post(
    "http://localhost:8000/api/auth/login",
    data={"username": "user@example.com", "password": "pass123"}
)
token = response.json()["access_token"]

# Analyze with file upload
with open("conversation.txt", "rb") as f:
    response = requests.post(
        "http://localhost:8000/api/upload/upload-and-analyze",
        files={"file": f},
        params={"privacy_mode": True, "save_to_db": True},
        headers={"Authorization": f"Bearer {token}"}
    )

result = response.json()
print(f"Score: {result['overall_score']}")
```

### JavaScript/TypeScript
```typescript
// Login
const loginResponse = await fetch('http://localhost:8000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    username: 'user@example.com',
    password: 'pass123'
  })
});
const { access_token } = await loginResponse.json();

// Upload and analyze
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch(
  'http://localhost:8000/api/upload/upload-and-analyze?privacy_mode=true',
  {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${access_token}` },
    body: formData
  }
);

const result = await response.json();
console.log(`Score: ${result.overall_score}`);
```

### cURL
```bash
# Login
TOKEN=$(curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=user@example.com&password=pass123" \
  | jq -r '.access_token')

# Upload and analyze
curl -X POST "http://localhost:8000/api/upload/upload-and-analyze?privacy_mode=true" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@conversation.txt"
```

---

## Development

### Run Server
```bash
# Development
python -m backend.app.main

# Production
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000
```

### Environment Variables
```bash
# .env file
APP_NAME="İlişki Analiz AI"
ENVIRONMENT=development
DEBUG=true
DATABASE_URL=sqlite:///./iliski_analiz.db
SECRET_KEY=your-secret-key-here
```

### Database Init
```bash
python scripts/init_db.py
```
