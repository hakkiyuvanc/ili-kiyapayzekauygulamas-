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
