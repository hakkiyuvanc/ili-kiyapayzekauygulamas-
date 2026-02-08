# Contributing to AMOR AI

Merhaba! AMOR AI projesine katkıda bulunmak istediğiniz için teşekkürler! 💗

## 📋 İçindekiler

- [Code of Conduct](#code-of-conduct)
- [Başlarken](#başlarken)
- [Geliştirme Ortamı](#geliştirme-ortamı)
- [Kod Standartları](#kod-standartları)
- [Commit Mesajları](#commit-mesajları)
- [Pull Request Süreci](#pull-request-süreci)
- [Testing](#testing)

---

## Code of Conduct

Bu proje profesyonel ve saygılı bir ortam sağlamayı amaçlar. Lütfen:

- ✅ Saygılı ve yapıcı olun
- ✅ Farklı görüşlere açık olun
- ✅ Hatalardan öğrenmeye odaklanın
- ❌ Kişisel saldırılardan kaçının

---

## Başlarken

### 1. Repository'yi Fork Edin

```bash
# Fork'u clone edin
git clone https://github.com/YOUR_USERNAME/ili-kiyapayzekauygulamas-.git
cd ili-kiyapayzekauygulamas-

# Upstream ekleyin
git remote add upstream https://github.com/ORIGINAL_OWNER/ili-kiyapayzekauygulamas-.git
```

### 2. Branch Oluşturun

```bash
# Feature branch oluşturun
git checkout -b feature/amazing-feature

# Bug fix için
git checkout -b fix/bug-description
```

---

## Geliştirme Ortamı

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

**Port:** http://localhost:3000

### Backend Setup

```bash
cd backend

# Virtual environment oluşturun
python3 -m venv venv
source venv/bin/activate  # Mac/Linux
# venv\Scripts\activate   # Windows

# Dependencies yükleyin
pip install -r ../requirements.txt

# Backend'i başlatın
python3 -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

**Port:** http://127.0.0.1:8000

### Environment Variables

`.env.local` dosyası oluşturun:

```env
# Frontend
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000

# Backend (.env)
DATABASE_URL=sqlite:///./amor_ai.db
SECRET_KEY=your-secret-key-here
GEMINI_API_KEY=your-gemini-api-key
```

---

## Kod Standartları

### TypeScript/React (Frontend)

#### 1. **Naming Conventions**

```typescript
// ✅ Components - PascalCase
export function ChatScreen() {}

// ✅ Functions/Variables - camelCase
const loadUserData = () => {};

// ✅ Constants - UPPER_SNAKE_CASE
const MAX_MESSAGE_LENGTH = 5000;

// ✅ Types/Interfaces - PascalCase
interface UserProfile {}
type MessageType = "user" | "assistant";
```

#### 2. **Component Structure**

```typescript
// ✅ Preferred structure
import { useState, useEffect, useCallback } from 'react';
import { ExternalLibrary } from 'external-lib';
import { LocalComponent } from '@/components/LocalComponent';

interface ComponentProps {
  // Props definition
}

export function Component({ prop1, prop2 }: ComponentProps) {
  // 1. State declarations
  const [state, setState] = useState();

  // 2. Memoized functions (useCallback)
  const memoizedFn = useCallback(() => {}, []);

  // 3. Effects
  useEffect(() => {}, []);

  // 4. Event handlers
  const handleClick = () => {};

  // 5. Render
  return <div>...</div>;
}
```

#### 3. **React Hooks Best Practices**

```typescript
// ✅ Use useCallback for functions in useEffect
const loadData = useCallback(
  async () => {
    // Implementation
  },
  [
    /* dependencies */
  ],
);

useEffect(() => {
  loadData();
}, [loadData]);

// ❌ Avoid
useEffect(() => {
  loadData(); // Missing dependency warning
}, []);

const loadData = async () => {};
```

#### 4. **Import Organization**

```typescript
// 1. React imports
import { useState, useEffect } from "react";

// 2. External libraries
import { motion } from "framer-motion";
import { Heart } from "lucide-react";

// 3. Internal components
import { ChatScreen } from "@/components/ChatScreen";

// 4. Types
import { User, Message } from "@/types";

// 5. Utils/API
import { api } from "@/lib/api";
```

### Python (Backend)

#### 1. **Code Style**

```python
# Follow PEP 8
# Use Black for formatting
# Use type hints

from typing import Optional, List

async def get_user_profile(
    user_id: int,
    include_stats: bool = False
) -> Optional[UserProfile]:
    """
    Get user profile by ID.

    Args:
        user_id: The user's unique identifier
        include_stats: Whether to include usage statistics

    Returns:
        UserProfile object or None if not found
    """
    # Implementation
    pass
```

#### 2. **Naming Conventions**

```python
# ✅ Functions/Variables - snake_case
def calculate_relationship_score():
    pass

# ✅ Classes - PascalCase
class UserService:
    pass

# ✅ Constants - UPPER_SNAKE_CASE
MAX_RETRIES = 3
```

### Romantic iOS Theme 🎨

Uygulama romantic iOS teması kullanır. Yeni component'ler eklerken:

```typescript
// ✅ Use romantic color palette
className = "bg-romantic-gradient-soft";
className = "text-[#B76E79]"; // Rose gold
className = "text-[#FFB6C1]"; // Blush pink
className = "text-[#FF7F7F]"; // Coral

// ✅ Use iOS-style components
className = "ios-card";
className = "ios-card-elevated";
className = "ios-button-primary";
className = "ios-scroll";

// ✅ Add safe area support
className = "safe-top safe-bottom";
```

---

## Commit Mesajları

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: Yeni özellik
- `fix`: Bug fix
- `docs`: Documentation değişiklikleri
- `style`: Code formatting (kod mantığı değişmez)
- `refactor`: Code refactoring
- `test`: Test ekleme/düzeltme
- `chore`: Build process, dependencies

### Örnekler

```bash
# ✅ Good
feat(chat): add romantic theme to chat page
fix(auth): resolve login redirect issue
docs(readme): update setup instructions

# ✅ With body
feat(chat): add useCallback for async functions

- Wrapped loadSessions with useCallback
- Fixed exhaustive-deps warnings
- Improved performance with memoization

Closes #123

# ❌ Bad
update stuff
fixed bug
changes
```

---

## Pull Request Süreci

### 1. Kod Kalitesi Kontrolleri

```bash
# Frontend
cd frontend
npm run lint        # ESLint check
npm run type-check  # TypeScript check (if available)
npm test           # Run tests

# Backend
cd backend
black .            # Format code
flake8            # Lint check
pytest            # Run tests
```

### 2. PR Template

```markdown
## Değişiklikler

- [ ] Feature/Bug açıklaması
- [ ] Etkilenen dosyalar

## Test Edildi

- [ ] Frontend çalışıyor
- [ ] Backend çalışıyor
- [ ] Testler geçiyor
- [ ] Lint hataları yok

## Screenshots (UI değişiklikleri için)

[Ekran görüntüleri ekleyin]

## Checklist

- [ ] Code review için hazır
- [ ] Documentation güncellendi
- [ ] Commit mesajları anlamlı
```

### 3. Review Süreci

1. **Self Review**: Kendi PR'ınızı gözden geçirin
2. **Automated Checks**: Lint, tests pass olmalı
3. **Code Review**: En az 1 reviewer onayı
4. **Merge**: Squash and merge tercih edilir

---

## Testing

### Frontend Tests

```bash
cd frontend

# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

### Test Yazma

```typescript
import { render, screen } from '@testing-library/react';
import { ChatScreen } from './ChatScreen';

describe('ChatScreen', () => {
  it('renders chat interface', () => {
    render(<ChatScreen />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('sends message on submit', async () => {
    // Test implementation
  });
});
```

### Backend Tests

```bash
cd backend
pytest                    # Run all tests
pytest -v                # Verbose
pytest --cov=app        # With coverage
```

---

## Code Review Checklist

### Reviewer İçin

- [ ] Kod okunabilir ve anlaşılır mı?
- [ ] Best practices uygulanmış mı?
- [ ] Test coverage yeterli mi?
- [ ] Documentation güncel mi?
- [ ] Performance etkileri var mı?
- [ ] Security riskleri var mı?
- [ ] Romantic theme tutarlı mı?

### Author İçin

- [ ] Self-review yaptım
- [ ] Lint warnings yok
- [ ] Tests geçiyor
- [ ] Documentation ekledim
- [ ] Breaking changes belirttim
- [ ] Screenshots ekledim (UI için)

---

## Sık Sorulan Sorular

### Q: Hangi branch'e PR açmalıyım?

**A:** `main` branch'e açın. Feature branch'ler `feature/` prefix'i ile başlamalı.

### Q: Lint warnings nasıl düzeltilir?

**A:** `npm run lint` çalıştırın. Çoğu warning otomatik düzeltilebilir.

### Q: Backend dependency nasıl eklenir?

**A:** `requirements.txt` dosyasına ekleyin ve `pip install -r requirements.txt` çalıştırın.

### Q: Romantic theme renkleri nerede?

**A:** `frontend/app/globals.css` dosyasında CSS variables olarak tanımlı.

---

## Yardım ve İletişim

- 🐛 **Bug Report**: GitHub Issues
- 💡 **Feature Request**: GitHub Discussions
- 📧 **Email**: [email]
- 💬 **Chat**: [Discord/Slack link]

---

## Teşekkürler! 💗

Katkılarınız için teşekkür ederiz. Her PR, AMOR AI'yi daha iyi hale getirir!

**Happy Coding!** ✨
