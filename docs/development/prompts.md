# AI Prompt Sistemi Dokümantasyonu

## Genel Bakış

İlişki Analiz AI uygulaması, gelişmiş içgörüler ve öneriler üretmek için OpenAI (GPT-4o-mini) veya Anthropic (Claude 3.5 Sonnet) kullanır.

## Yapılandırma

### Environment Variables

```env
# AI'yi etkinleştir/devre dışı bırak
AI_ENABLED=true

# Provider seçimi: openai, anthropic, none
AI_PROVIDER=openai

# OpenAI ayarları
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini

# Anthropic ayarları
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022

# Token limitleri
AI_MAX_TOKENS_INSIGHTS=1000
AI_MAX_TOKENS_RECOMMENDATIONS=800
```

## AI Servisi Mimarisi

### 1. İçgörü Oluşturma (Insights Generation)

**Amaç:** Analiz metriklerine dayalı derinlemesine psikolojik içgörüler üretmek.

**Prompt Yapısı:**
```
Sen bir ilişki psikoloğusun. Aşağıdaki konuşma analiz metriklerine göre derinlemesine içgörüler üret.

METRIKLER:
{
  "sentiment": {"score": 62.5, "label": "Olumlu"},
  "empathy": {"score": 100, "label": "Yüksek"},
  "conflict": {"score": 0, "label": "Çok Düşük"},
  "we_language": {"score": 20, "label": "Zayıf"},
  "communication_balance": {"score": 62.28, "label": "İyi Denge"}
}

KONUŞMA ÖZETI:
İletişiminiz genel olarak pozitif bir ton taşıyor. Empatik iletişim örnekleri mevcut...

Lütfen 4-6 adet içgörü üret. Her içgörü şu formatta olmalı:
- category: "Güçlü Yön", "Gelişim Alanı", veya "Dikkat Noktası"
- title: Kısa başlık (max 50 karakter)
- description: Detaylı açıklama (100-150 karakter)

Çıktını JSON array formatında ver
```

**Beklenen Çıktı:**
```json
[
  {
    "category": "Güçlü Yön",
    "title": "Yüksek Empati Seviyesi",
    "description": "İletişiminizde karşınızı anlamaya yönelik güçlü bir çaba var. Bu, ilişkide güven ve yakınlık oluşturmanın temel taşıdır."
  },
  {
    "category": "Gelişim Alanı",
    "title": "Biz-dili Kullanımı Zayıf",
    "description": "Bireysel ifadeler ağırlıkta. 'Biz', 'birlikte' gibi kelimeler kullanarak ortaklık hissini güçlendirebilirsiniz."
  }
]
```

### 2. Öneri Oluşturma (Recommendations Generation)

**Amaç:** İçgörülere dayalı somut, uygulanabilir eylem önerileri.

**Prompt Yapısı:**
```
Sen bir ilişki koçusun. Aşağıdaki metriklere ve içgörülere göre uygulanabilir öneriler üret.

METRIKLER: {...}
İÇGÖRÜLER: [...]

Lütfen 4-5 adet somut, uygulanabilir öneri üret. Her öneri şu formatta olmalı:
- category: "İletişim", "Empati", "Çatışma Yönetimi", veya "Bağ Güçlendirme"
- title: Kısa başlık (max 50 karakter)
- description: Detaylı, uygulanabilir öneri (100-150 karakter)
```

**Beklenen Çıktı:**
```json
[
  {
    "category": "Bağ Güçlendirme",
    "title": "Ortak Hedefler Belirleyin",
    "description": "'Bizim için ne iyi?' sorusunu sorun. Haftalık bir 'biz' planı yapın ve birlikte karar alın."
  },
  {
    "category": "İletişim",
    "title": "Günlük Check-in Rutini",
    "description": "Her gün 10 dakika telefonlar kapalı konuşun. Sadece dinleyin ve 'Anlıyorum' deyin."
  }
]
```

### 3. Özet Geliştirme (Summary Enhancement)

**Amaç:** Teknik özeti daha empatik ve anlaşılır hale getirmek.

**Prompt Yapısı:**
```
Aşağıdaki ilişki analizi özetini daha anlaşılır ve empatik hale getir:

MEVCUT ÖZET:
İletişiminiz genel olarak pozitif bir ton taşıyor. Empatik iletişim örnekleri mevcut...

METRIKLER:
- Duygu Skoru: 62.5
- Empati Skoru: 100
- Çatışma Skoru: 0

Kısa (2-3 cümle), destekleyici ve yapıcı bir özet oluştur.
```

**Beklenen Çıktı:**
```
İletişiminiz sevgi ve anlayış dolu. Birbirinize karşı gösterdiğiniz empati, ilişkinizin en güçlü yanı. 'Biz' dilini biraz daha kullanarak bu güçlü temeli daha da sağlamlaştırabilirsiniz.
```

## Fallback Sistemi

AI servisi kullanılamadığında (API key yok, hata, vb.) **rule-based** sistem devreye girer:

### Rule-Based İçgörüler

```python
if sentiment_score >= 60:
    insights.append({
        "category": "Güçlü Yön",
        "title": "Olumlu İletişim",
        "description": "İletişiminiz genel olarak pozitif ve destekleyici bir ton taşıyor."
    })
```

### Rule-Based Öneriler

```python
if we_score < 40:
    recommendations.append({
        "category": "Bağ Güçlendirme",
        "title": "Biz-dili Kullanın",
        "description": "'Biz', 'bizim' gibi kelimeler kullanarak ortak hedeflerinizi vurgulayın."
    })
```

## API Kullanımı

### OpenAI Entegrasyonu

```python
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "system", "content": "Sen Türkçe konuşan profesyonel bir ilişki terapistisin."},
        {"role": "user", "content": prompt}
    ],
    max_tokens=1000,
    temperature=0.7
)

content = response.choices[0].message.content
```

### Anthropic Entegrasyonu

```python
from anthropic import Anthropic

client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

response = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1000,
    temperature=0.7,
    messages=[
        {"role": "user", "content": prompt}
    ]
)

content = response.content[0].text
```

## Test Senaryoları

### Test 1: AI Etkin (OpenAI)

```bash
export AI_ENABLED=true
export AI_PROVIDER=openai
export OPENAI_API_KEY=sk-...

python test_ai_integration.py
```

**Beklenen:** AI-generated insights ve recommendations

### Test 2: AI Devre Dışı

```bash
export AI_ENABLED=false

python test_ai_integration.py
```

**Beklenen:** Rule-based insights ve recommendations

### Test 3: AI Hatası

```bash
export AI_ENABLED=true
export OPENAI_API_KEY=invalid-key

python test_ai_integration.py
```

**Beklenen:** Fallback to rule-based (hata loglanır)

## Performans ve Maliyet

### OpenAI GPT-4o-mini
- **Hız:** ~2-3 saniye
- **Maliyet:** $0.15/1M input tokens, $0.60/1M output tokens
- **Ortalama:** ~$0.0002 per request (2000 tokens)

### Anthropic Claude 3.5 Sonnet
- **Hız:** ~2-4 saniye
- **Maliyet:** $3/1M input tokens, $15/1M output tokens
- **Ortalama:** ~$0.004 per request

### Optimizasyon Stratejileri

1. **Caching:** Aynı metrikler için sonuçları cache'le (Redis)
2. **Batch Processing:** Birden fazla isteği grupla
3. **Rate Limiting:** API limitlerini aşma
4. **Fallback First:** Basit durumlarda AI kullanma

## Güvenlik ve Gizlilik

### PII Maskeleme

Promptlara gönderilen metinler otomatik olarak maskelenir:

```python
preprocessed = preprocessor.preprocess(
    text,
    remove_pii=True  # Email, telefon, adres maskelenir
)
```

### API Key Güvenliği

- `.env` dosyası `.gitignore`'da
- Environment variables kullan
- Production'da secret manager (AWS Secrets, Azure Key Vault)

### Data Retention

- Promptlar loglanmaz
- API responses cache'lenir (opsiyonel, 1 saat)
- Kullanıcı verileri anonimleştirilir

## Monitoring

### Metrics

```python
from backend.app.core.performance import PerformanceMonitor

monitor = PerformanceMonitor()

with monitor.time_operation("ai_insights"):
    insights = ai_service.generate_insights(metrics, summary)

stats = monitor.get_stats()
# {"ai_insights": {"count": 1, "total_time": 2.5, "avg_time": 2.5}}
```

### Logging

```python
import logging

logger = logging.getLogger(__name__)

try:
    insights = ai_service.generate_insights(...)
    logger.info(f"AI insights generated: {len(insights)} items")
except Exception as e:
    logger.error(f"AI insights failed: {e}", exc_info=True)
```

## Prompt Engineering Tips

### 1. Türkçe Spesifik Talimatlar

```
"Türkçe dilinde, empatik ve destekleyici bir tonda yaz."
```

### 2. Format Belirtme

```
"Çıktını JSON array formatında ver. Markdown kullanma."
```

### 3. Karakter Limitleri

```
"title: Kısa başlık (max 50 karakter)"
"description: Detaylı açıklama (100-150 karakter)"
```

### 4. Kategori Kısıtlamaları

```
"category: sadece şunlardan biri: 'Güçlü Yön', 'Gelişim Alanı', 'Dikkat Noktası'"
```

### 5. Örnekler

```
Örnek çıktı:
[
  {"category": "Güçlü Yön", "title": "...", "description": "..."}
]
```

## Hata Yönetimi

### Yaygın Hatalar

| Hata | Sebep | Çözüm |
|------|-------|-------|
| `AuthenticationError` | Yanlış API key | `.env` dosyasını kontrol et |
| `RateLimitError` | Çok fazla istek | Rate limiter ekle, bekle ve tekrar dene |
| `TimeoutError` | Yavaş yanıt | Timeout artır veya retry ekle |
| `JSONDecodeError` | Bozuk yanıt | Fallback'e geç, promptu düzelt |

### Retry Stratejisi

```python
from tenacity import retry, stop_after_attempt, wait_exponential

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10)
)
def call_ai_with_retry():
    return ai_service.generate_insights(...)
```

## İleri Seviye

### Custom System Prompts

```python
class AIService:
    def __init__(self, system_prompt: str = None):
        self.system_prompt = system_prompt or "Sen profesyonel bir ilişki terapistisin."
```

### Fine-tuning

OpenAI fine-tuning için training data:

```jsonl
{"messages": [{"role": "system", "content": "..."}, {"role": "user", "content": "..."}, {"role": "assistant", "content": "..."}]}
```

### Local Models

Llama.cpp ile yerel model desteği:

```python
from llama_cpp import Llama

model = Llama(model_path="./models/turkish-llama-7b.gguf")
response = model("Prompt...")
```

## Lisanslama

AI provider'lar kendi terms of service'lerine tabidir:
- [OpenAI Terms](https://openai.com/terms)
- [Anthropic Terms](https://www.anthropic.com/legal/terms)
