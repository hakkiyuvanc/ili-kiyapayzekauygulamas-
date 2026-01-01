# 👨‍💻 Geliştirici Kılavuzu

> **İlişki Analiz AI** - Yeni geliştiriciler için kapsamlı başlangıç rehberi

Bu kılavuz projeye katkıda bulunmak isteyen geliştiriciler için hazırlanmıştır.

## 📋 İçindekiler

1. [Hızlı Başlangıç](#-hızlı-başlangıç)
2. [Geliştirme Ortamı](#-geliştirme-ortamı)
3. [Kod Standartları](#-kod-standartları)
4. [Testing Stratejisi](#-testing-stratejisi)
5. [Git Workflow](#-git-workflow)
6. [Debugging](#-debugging-ipuçları)
7. [Deployment](#-deployment)
8. [Sık Karşılaşılan Sorunlar](#-sık-karşılaşılan-sorunlar)

## 🚀 Hızlı Başlangıç

### Önkoşullar

- **Python 3.10+** - Backend için
- **Node.js 18+** - Frontend için
- **PostgreSQL 14+** - Production database (opsiyonel, SQLite ile başlayabilirsiniz)
- **Git** - Versiyon kontrolü
- **VS Code** (önerilir) - IDE

### İlk Kurulum (5 dakika)

```bash
# 1. Repository'yi klonla
git clone https://github.com/hakkiyuvanc/ili-kiyapayzekauygulamas-.git
cd ili-kiyapayzekauygulamas-

# 2. Backend kurulumu
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -e ".[dev]"

# Türkçe NLP modeli
python -m spacy download tr_core_news_lg

# Environment dosyası
cp .env.example .env
# .env dosyasını düzenle (AI API keys, database URL, vb.)

# Database migration
cd ..
alembic upgrade head

# 3. Frontend kurulumu
cd frontend
npm install

# Environment dosyası
cp .env.local.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:8000

cd ..
```

### Development Server'ları Başlat

**Terminal 1 - Backend**:
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

**Terminal 2 - Frontend**:
```bash
cd frontend
npm run dev
```

Tarayıcıda `http://localhost:3000` adresini aç.

## 🛠️ Geliştirme Ortamı

### VS Code Önerilen Eklentiler

**Python**:
- Python (Microsoft)
- Pylance
- Python Docstring Generator
- autoDocstring

**JavaScript/TypeScript**:
- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense
- ES7+ React/Redux/React-Native snippets

**Genel**:
- GitLens
- Error Lens
- Better Comments
- Thunder Client (API testing)

### VS Code Ayarları

`.vscode/settings.json`:
```json
{
  "python.defaultInterpreterPath": "./backend/venv/bin/python",
  "python.linting.enabled": true,
  "python.linting.pylintEnabled": true,
  "python.formatting.provider": "black",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports": true
  },
  "[python]": {
    "editor.defaultFormatter": "ms-python.black-formatter"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

### Database Kurulumu

#### SQLite (Development)

Varsayılan olarak SQLite kullanılır, kurulum gerekmez:
```bash
DATABASE_URL=sqlite:///./iliski_analiz.db
```

#### PostgreSQL (Production-like)

```bash
# macOS
brew install postgresql
brew services start postgresql

# Ubuntu
sudo apt-get install postgresql
sudo systemctl start postgresql

# Database oluştur
createdb iliski_analiz_ai

# .env dosyasını güncelle
DATABASE_URL=postgresql://user:password@localhost:5432/iliski_analiz_ai
```

### AI API Keys

OpenAI veya Anthropic hesabı oluşturun:

**OpenAI**:
1. https://platform.openai.com/api-keys
2. API key oluştur
3. `.env` dosyasına ekle:
```bash
OPENAI_API_KEY=sk-proj-...
```

**Anthropic** (opsiyonel):
1. https://console.anthropic.com/
2. API key oluştur
3. `.env` dosyasına ekle:
```bash
ANTHROPIC_API_KEY=sk-ant-...
```

> **Not**: AI olmadan da çalışır, rule-based fallback sistemi vardır.

## 📏 Kod Standartları

### Python (Backend)

#### Code Style

**PEP 8** standardını takip ediyoruz:
- 4 boşluk indentation
- Satır uzunluğu max 120 karakter
- Snake_case fonksiyon ve değişken isimleri
- PascalCase class isimleri

**Formatting**:
```bash
# Black ile otomatik format
black backend/

# Import'ları düzenle
isort backend/

# Linting kontrolü
pylint backend/app
```

#### Docstrings

Her modül, sınıf ve fonksiyona docstring ekleyin:

```python
def analyze_conversation(
    text: str,
    user_id: str,
    use_ai: bool = True
) -> AnalysisResult:
    """
    Konuşma metnini analiz eder ve ilişki metrikleri hesaplar.
    
    Args:
        text: Analiz edilecek metin
        user_id: Kullanıcı ID'si
        use_ai: AI kullanılsın mı (default: True)
    
    Returns:
        AnalysisResult: Analiz sonucu ve metrikler
    
    Raises:
        ValueError: Metin boş veya çok kısa ise
        APIError: AI servisi hatası durumunda
    
    Example:
        >>> result = analyze_conversation("Merhaba nasılsın?", "user-123")
        >>> print(result.metrics.empathy_score)
        0.85
    """
    pass
```

#### Type Hints

Her fonksiyonda tip belirtimi kullanın:

```python
from typing import List, Optional, Dict, Any
from datetime import datetime

def get_user_analyses(
    user_id: str,
    start_date: Optional[datetime] = None,
    limit: int = 10
) -> List[Dict[str, Any]]:
    """Kullanıcının analizlerini getirir."""
    pass
```

### TypeScript (Frontend)

#### Code Style

- 2 boşluk indentation
- Semicolon kullan
- Single quotes tercih et
- camelCase değişken isimleri
- PascalCase komponent isimleri

**Formatting**:
```bash
# Prettier ile format
npm run format

# ESLint kontrolü
npm run lint

# TypeScript type check
npm run type-check
```

#### JSDoc Comments

Her komponent ve fonksiyona açıklama ekleyin:

```typescript
/**
 * Analiz sonuçlarını görselleştiren komponent.
 * 
 * AI tarafından üretilen metrikleri, içgörüleri ve önerileri
 * kullanıcı dostu bir şekilde gösterir.
 * 
 * @component
 * @example
 * ```tsx
 * <AnalysisResult
 *   data={analysisData}
 *   onClose={() => router.push('/dashboard')}
 * />
 * ```
 */
interface AnalysisResultProps {
  /** Analiz verisi */
  data: AnalysisData;
  /** Kapanış callback'i */
  onClose?: () => void;
  /** Yükleniyor durumu */
  isLoading?: boolean;
}

export function AnalysisResult({ 
  data, 
  onClose,
  isLoading = false 
}: AnalysisResultProps): JSX.Element {
  // ...
}
```

#### React Best Practices

**1. Functional Components**:
```typescript
// ✅ İyi
export function Dashboard() {
  return <div>Dashboard</div>;
}

// ❌ Kötü
export class Dashboard extends React.Component {
  render() {
    return <div>Dashboard</div>;
  }
}
```

**2. Custom Hooks**:
```typescript
// Reusable logic için hook kullan
function useAnalysis(analysisId: string) {
  const [data, setData] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchAnalysis(analysisId).then(setData);
  }, [analysisId]);
  
  return { data, loading };
}
```

**3. Props Destructuring**:
```typescript
// ✅ İyi
function Button({ label, onClick, disabled = false }) {
  return <button onClick={onClick} disabled={disabled}>{label}</button>;
}

// ❌ Kötü
function Button(props) {
  return <button onClick={props.onClick}>{props.label}</button>;
}
```

## 🧪 Testing Stratejisi

### Backend Tests

**Pytest** kullanıyoruz:

```bash
# Tüm testleri çalıştır
pytest

# Belirli bir dosya
pytest tests/test_api/test_auth.py

# Coverage raporu
pytest --cov=backend --cov-report=html
open htmlcov/index.html
```

**Test Yazma**:

```python
# tests/test_api/test_analysis.py
import pytest
from fastapi.testclient import TestClient

def test_create_analysis(client: TestClient, auth_headers):
    """Analiz oluşturma endpoint'ini test eder."""
    response = client.post(
        "/api/analysis/text",
        json={"text": "Merhaba nasılsın?"},
        headers=auth_headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert "metrics" in data
    assert data["metrics"]["empathy_score"] >= 0
```

### Frontend Tests

**Jest + React Testing Library**:

```bash
# Testleri çalıştır
npm test

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage
```

**Test Yazma**:

```typescript
// components/__tests__/AnalysisResult.test.tsx
import { render, screen } from '@testing-library/react';
import { AnalysisResult } from '../AnalysisResult';

describe('AnalysisResult', () => {
  it('displays analysis metrics correctly', () => {
    const mockData = {
      metrics: {
        empathy_score: 0.85,
        conflict_score: 0.23
      }
    };
    
    render(<AnalysisResult data={mockData} />);
    
    expect(screen.getByText(/Empati/i)).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
  });
});
```

## 🔄 Git Workflow

### Branch Stratejisi

```
main          # Production-ready code
├── develop   # Development branch
    ├── feature/auth-improvements
    ├── feature/new-chat-ui
    ├── bugfix/login-error
    └── hotfix/critical-security-fix
```

### Commit Message Formatı

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type**:
- `feat`: Yeni özellik
- `fix`: Bug fix
- `docs`: Dokümantasyon
- `style`: Formatting, linting
- `refactor`: Code refactoring
- `test`: Test ekleme
- `chore`: Build, dependencies

**Örnekler**:
```bash
feat(auth): add email verification system

Implemented email verification flow with token-based
confirmation. Users receive an email after registration
and must verify before accessing the app.

Closes #123

---

fix(analysis): handle empty text input gracefully

Added validation to prevent crashes when user submits
empty text for analysis.

---

docs(readme): update installation instructions

Updated Python version requirement to 3.10+
```

### Pull Request Süreci

1. **Branch oluştur**:
```bash
git checkout -b feature/my-new-feature develop
```

2. **Değişiklikleri yap ve commit et**:
```bash
git add .
git commit -m "feat(feature): add amazing feature"
```

3. **Push ve PR aç**:
```bash
git push origin feature/my-new-feature
# GitHub'da PR oluştur
```

4. **Code Review** bekle ve gerekli değişiklikleri yap

5. **Merge** edildiğinde branch'i sil:
```bash
git branch -d feature/my-new-feature
```

## 🐛 Debugging İpuçları

### Backend Debugging

**1. FastAPI Debug Mode**:
```python
# backend/app/main.py
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="debug"  # Detaylı loglar
    )
```

**2. pdb Debugger**:
```python
import pdb

def analyze_text(text: str):
    pdb.set_trace()  # Breakpoint
    # Kod buradan adım adım çalışır
    result = process_text(text)
    return result
```

**3. Logging**:
```python
import logging

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

def my_function():
    logger.debug("Function called")
    logger.info("Processing data")
    logger.warning("Unexpected value")
    logger.error("Something went wrong")
```

**4. API Testing**:
```bash
# Swagger UI
http://localhost:8000/docs

# Thunder Client (VS Code)
# veya Postman kullan
```

### Frontend Debugging

**1. React DevTools**:
- Chrome extension yükle
- Komponent tree'sini incele
- Props ve state'i görüntüle

**2. Console Debugging**:
```typescript
console.log('Debug:', { data, isLoading });
console.table(arrayData);
console.group('API Call');
console.log('Request:', request);
console.log('Response:', response);
console.groupEnd();
```

**3. VS Code Debugger**:

`.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    }
  ]
}
```

**4. Network Tab**:
- Chrome DevTools > Network
- API çağrılarını izle
- Request/Response payload'ları incele

## 🚀 Deployment

### Backend Deployment (Railway/Render)

**1. requirements.txt oluştur**:
```bash
pip freeze > requirements.txt
```

**2. Procfile** (Railway için):
```
web: uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT
```

**3. Environment Variables** ayarla:
- `DATABASE_URL`
- `SECRET_KEY`
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`

### Frontend Deployment (Vercel)

**1. Build testi**:
```bash
npm run build
npm start
```

**2. Vercel'e deploy**:
```bash
npm install -g vercel
vercel
```

**3. Environment Variables**:
- `NEXT_PUBLIC_API_URL`: Production backend URL

### Desktop App Build

**Electron Builder**:
```bash
# macOS
npm run electron-build -- --mac

# Windows
npm run electron-build -- --win

# Linux
npm run electron-build -- --linux
```

## 🔥 Sık Karşılaşılan Sorunlar

### Backend

**Problem**: `ModuleNotFoundError: No module named 'spacy'`
```bash
# Çözüm
pip install -e ".[dev]"
python -m spacy download tr_core_news_lg
```

**Problem**: Database migration hatası
```bash
# Çözüm: Database'i sıfırla
alembic downgrade base
alembic upgrade head
```

**Problem**: CORS hatası
```python
# backend/app/main.py'de CORS middleware'i kontrol et
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Frontend

**Problem**: `Cannot find module` hatası
```bash
# Çözüm
rm -rf node_modules package-lock.json
npm install
```

**Problem**: API bağlantı hatası
```bash
# .env.local dosyasını kontrol et
NEXT_PUBLIC_API_URL=http://localhost:8000

# Backend'in çalıştığından emin ol
curl http://localhost:8000/health
```

**Problem**: TypeScript compile hatası
```bash
# Çözüm
npm run type-check
# Hataları düzelt, gerekirse:
rm -rf .next
npm run dev
```

## 📚 Faydalı Kaynaklar

### Dokümantasyon
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev/)
- [SQLAlchemy Docs](https://docs.sqlalchemy.org/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Öğrenimi
- [Python Type Hints](https://realpython.com/python-type-checking/)
- [React Hooks Guide](https://react.dev/reference/react)
- [Async/Await in Python](https://realpython.com/async-io-python/)

### Araçlar
- [Postman](https://www.postman.com/) - API testing
- [DBeaver](https://dbeaver.io/) - Database management
- [GitHub Desktop](https://desktop.github.com/) - Git GUI

## 🤝 Katkıda Bulunma

1. Issue aç veya mevcut issue'yu seç
2. Feature branch oluştur
3. Kodunu yaz ve test et
4. Pull request aç
5. Code review bekle
6. Merge edilsin! 🎉

## ❓ Yardım

Sorunlarla karşılaşırsanız:
- [GitHub Issues](https://github.com/hakkiyuvanc/ili-kiyapayzekauygulamas-/issues)
- Proje documentation'ını inceleyin
- Code review'larda soru sorun

---

**Happy Coding! 💻✨**

_Son Güncelleme: 29 Aralık 2025_
