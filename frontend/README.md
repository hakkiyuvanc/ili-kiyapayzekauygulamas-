# Frontend - Next.js + Electron App

> İlişki Analiz AI Frontend Dokümantasyonu

## 📋 Genel Bakış

Modern, responsive ve kullanıcı dostu bir arayüz sunan desktop ve web uygulaması.

### Teknoloji Stack

- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript 5+
- **Styling**: Tailwind CSS 3+
- **Desktop**: Electron 28+
- **Charts**: Recharts
- **Animation**: Framer Motion
- **HTTP Client**: Axios
- **State Management**: React Context + Hooks

## 🏗️ Proje Yapısı

```
frontend/
├── app/                    # Next.js App Router
│   ├── page.tsx            # Ana sayfa (/)
│   ├── layout.tsx          # Root layout
│   ├── providers.tsx       # Context providers
│   ├── auth/page.tsx       # Login/Register (/auth)
│   ├── dashboard/page.tsx  # Dashboard (/dashboard)
│   ├── chat/page.tsx       # AI Chat (/chat)
│   └── advanced/page.tsx   # Gelişmiş özellikler (/advanced)
│
├── components/             # React Components
│   ├── screens/            # Tam ekran komponentleri
│   ├── widgets/            # Dashboard widget'ları
│   ├── charts/             # Grafik komponentleri
│   ├── ui/                 # Temel UI bileşenleri
│   └── shared/             # Paylaşılan komponentler
│
├── lib/                    # Utility kütüphaneleri
│   ├── api.ts              # API client
│   ├── auth.ts             # Auth helpers
│   └── utils.ts            # Genel yardımcılar
│
├── hooks/                  # Custom React Hooks
│   └── useAuth.ts          # Authentication hook
│
├── contexts/               # React Contexts
│   └── AuthContext.tsx     # Auth state management
│
├── types/                  # TypeScript type definitions
│   └── index.d.ts
│
├── electron/               # Electron main process
│   ├── main.ts             # Electron entry point
│   ├── preload.ts          # Preload script
│   └── backend-manager.ts  # Backend auto-start
│
└── public/                 # Static assets
    ├── icons/
    └── images/
```

## 🎨 Komponent Hiyerarşisi

### Ana Ekranlar (Screens)

#### WelcomeScreen
**Dosya**: `components/WelcomeScreen.tsx`  
**Route**: `/` (ilk ziyaret)  
**Amaç**: Uygulama tanıtımı ve onboarding

**Özellikler**:
- Uygulama açıklaması
- Öne çıkan özellikler
- "Başla" CTA butonu

```typescript
export function WelcomeScreen() {
  return (
    <div className="welcome-container">
      <h1>İlişkinizi AI ile Güçlendirin</h1>
      <FeatureList />
      <Button onClick={() => router.push('/auth')}>
        Başla
      </Button>
    </div>
  );
}
```

#### AuthScreen
**Dosya**: `components/AuthScreen.tsx`  
**Route**: `/auth`  
**Amaç**: Kimlik doğrulama (login/register)

**Özellikler**:
- Email/password login formu
- Kayıt formu
- Email doğrulama
- Şifre sıfırlama

```typescript
export function AuthScreen() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const { login, register } = useAuth();
  
  return (
    <div className="auth-container">
      {mode === 'login' ? <LoginForm /> : <RegisterForm />}
    </div>
  );
}
```

#### DashboardScreen
**Dosya**: `components/DashboardScreen.tsx`  
**Route**: `/dashboard`  
**Amaç**: Ana kontrol paneli

**Alt Komponentler**:
- `DailyPulse` - Günlük check-in
- `WeeklyScoreCard` - Haftalık skor özeti
- `TrendChart` - Metrik trend grafikleri
- `InsightsScreen` - AI içgörüleri
- Widget'lar - Çeşitli mini araçlar

```typescript
export function DashboardScreen() {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState([]);
  
  return (
    <div className="dashboard-grid">
      <DailyPulse />
      <WeeklyScoreCard data={weeklyData} />
      <TrendChart analyses={analyses} />
      <WidgetGrid />
    </div>
  );
}
```

#### ChatScreen
**Dosya**: `components/ChatScreen.tsx`  
**Route**: `/chat`  
**Amaç**: AI ile interaktif sohbet

**Özellikler**:
- Mesaj geçmişi
- Real-time AI yanıtları
- Context-aware öneriler
- Markdown desteği

```typescript
export function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  
  const sendMessage = async () => {
    const response = await api.chat.send({ message: input });
    setMessages([...messages, response]);
  };
  
  return (
    <div className="chat-container">
      <MessageList messages={messages} />
      <ChatInput onSend={sendMessage} />
    </div>
  );
}
```

#### AnalysisScreen
**Dosya**: `components/AnalysisScreen.tsx`  
**Route**: `/dashboard` (modal/drawer)  
**Amaç**: Yeni analiz başlatma

**Analiz Türleri**:
- Metin girişi
- WhatsApp chat import
- Ses dosyası yükleme

```typescript
export function AnalysisScreen() {
  const [analysisType, setAnalysisType] = useState<'text' | 'whatsapp' | 'audio'>('text');
  
  const startAnalysis = async (data: AnalysisInput) => {
    const result = await api.analysis.create(data);
    // Sonuçları göster
  };
  
  return (
    <div>
      <AnalysisTypeSelector value={analysisType} onChange={setAnalysisType} />
      {analysisType === 'text' && <TextInput onSubmit={startAnalysis} />}
      {analysisType === 'whatsapp' && <WhatsAppUpload onSubmit={startAnalysis} />}
      {analysisType === 'audio' && <AudioUpload onSubmit={startAnalysis} />}
    </div>
  );
}
```

### Widget'lar

#### DailyPulse
**Dosya**: `components/DailyPulse.tsx`  
**Amaç**: Günlük durum check-in

```typescript
/**
 * Günlük check-in widget'ı.
 * Kullanıcının günlük ruh hali ve ilişki kalitesini takip eder.
 */
export function DailyPulse() {
  const [mood, setMood] = useState<string>('');
  const [quality, setQuality] = useState<number>(5);
  
  const submitCheckup = async () => {
    await api.daily.checkup({ mood, relationship_quality: quality });
  };
  
  return (
    <Card>
      <h3>Günlük Pulse</h3>
      <MoodSelector value={mood} onChange={setMood} />
      <QualitySlider value={quality} onChange={setQuality} />
      <Button onClick={submitCheckup}>Check-in Yap</Button>
    </Card>
  );
}
```

#### WeeklyScoreCard
**Dosya**: `components/WeeklyScoreCard.tsx`  
**Amaç**: Haftalık metrik özeti

```typescript
interface WeeklyScoreCardProps {
  data: {
    empathy: number;
    sentiment: number;
    conflict: number;
    balance: number;
  };
}

export function WeeklyScoreCard({ data }: WeeklyScoreCardProps) {
  return (
    <Card>
      <h3>Bu Hafta</h3>
      <MetricGrid>
        <MetricItem label="Empati" score={data.empathy} />
        <MetricItem label="Pozitiflik" score={data.sentiment} />
        <MetricItem label="Çatışma" score={data.conflict} inverted />
        <MetricItem label="Denge" score={data.balance} />
      </MetricGrid>
    </Card>
  );
}
```

#### LoveLanguageWidget
**Dosya**: `components/LoveLanguageWidget.tsx`  
**Amaç**: Sevgi dili analizi

```typescript
export function LoveLanguageWidget() {
  const [loveLanguages, setLoveLanguages] = useState([]);
  
  return (
    <Card>
      <h3>Sevgi Dilleriniz</h3>
      <LoveLanguageChart data={loveLanguages} />
      <RecommendationsList />
    </Card>
  );
}
```

### Grafik Komponentleri

#### TrendChart
**Dosya**: `components/charts/TrendChart.tsx`  
**Amaç**: Zaman serisi grafikleri (Recharts)

```typescript
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';

interface TrendChartProps {
  analyses: Analysis[];
  metric: 'empathy' | 'sentiment' | 'conflict';
}

export function TrendChart({ analyses, metric }: TrendChartProps) {
  const data = analyses.map(a => ({
    date: a.created_at,
    score: a.metrics[`${metric}_score`]
  }));
  
  return (
    <LineChart width={600} height={300} data={data}>
      <XAxis dataKey="date" />
      <YAxis domain={[0, 1]} />
      <Tooltip />
      <Legend />
      <Line type="monotone" dataKey="score" stroke="#8884d8" />
    </LineChart>
  );
}
```

#### MetricRadarChart
**Dosya**: `components/charts/MetricRadarChart.tsx`  
**Amaç**: Çok boyutlu metrik görselleştirme

```typescript
import { RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';

export function MetricRadarChart({ metrics }: { metrics: Metrics }) {
  const data = [
    { metric: 'Empati', value: metrics.empathy_score },
    { metric: 'Pozitiflik', value: metrics.sentiment_score },
    { metric: 'Biz-Dili', value: metrics.we_language_score },
    { metric: 'Denge', value: metrics.balance_score },
  ];
  
  return (
    <RadarChart width={400} height={400} data={data}>
      <PolarGrid />
      <PolarAngleAxis dataKey="metric" />
      <Radar dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
    </RadarChart>
  );
}
```

## 🔄 State Management

### Auth Context

**Dosya**: `contexts/AuthContext.tsx`

```typescript
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  
  useEffect(() => {
    // Token'ı localStorage'dan yükle
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      // User bilgilerini fetch et
    }
  }, []);
  
  const login = async (email: string, password: string) => {
    const response = await api.auth.login({ email, password });
    setToken(response.access_token);
    setUser(response.user);
    localStorage.setItem('token', response.access_token);
  };
  
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };
  
  return (
    <AuthContext.Provider value={{ user, token, login, logout, ... }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
```

## 🌐 API Client

**Dosya**: `lib/api.ts`

```typescript
import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Token ekle
client.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - Hata yönetimi
client.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Token expired, logout
      localStorage.removeItem('token');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

export const api = {
  auth: {
    login: (data: LoginData) => 
      client.post('/api/auth/login', data).then(res => res.data),
    register: (data: RegisterData) => 
      client.post('/api/auth/register', data).then(res => res.data),
  },
  
  analysis: {
    create: (data: AnalysisInput) => 
      client.post('/api/analysis/text', data).then(res => res.data),
    get: (id: string) => 
      client.get(`/api/analysis/${id}`).then(res => res.data),
    getHistory: (params?: { skip?: number; limit?: number }) => 
      client.get('/api/analysis/history', { params }).then(res => res.data),
  },
  
  chat: {
    send: (data: { message: string; context?: string }) => 
      client.post('/api/chat/send', data).then(res => res.data),
    getHistory: () => 
      client.get('/api/chat/history').then(res => res.data),
  },
  
  daily: {
    checkup: (data: DailyCheckupData) => 
      client.post('/api/daily/checkup', data).then(res => res.data),
    getInsights: () => 
      client.get('/api/daily/insights').then(res => res.data),
  },
};
```

## 🖥️ Electron Integration

### Main Process

**Dosya**: `electron/main.ts`

```typescript
import { app, BrowserWindow } from 'electron';
import { BackendManager } from './backend-manager';

const backendManager = new BackendManager();

async function createWindow() {
  // Backend'i başlat
  await backendManager.start();
  
  // Pencere oluştur
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });
  
  // Next.js dev server veya production build yükle
  const isDev = !app.isPackaged;
  const url = isDev 
    ? 'http://localhost:3000' 
    : `file://${path.join(__dirname, '../out/index.html')}`;
  
  win.loadURL(url);
}

app.whenReady().then(createWindow);

app.on('before-quit', async () => {
  await backendManager.stop();
});
```

### Backend Manager

**Dosya**: `electron/backend-manager.ts`

```typescript
import { spawn, ChildProcess } from 'child_process';
import path from 'path';

export class BackendManager {
  private process: ChildProcess | null = null;
  
  async start(): Promise<void> {
    const pythonPath = this.getPythonPath();
    const backendPath = path.join(__dirname, '../../backend');
    
    this.process = spawn(pythonPath, [
      '-m',
      'uvicorn',
      'app.main:app',
      '--host',
      '127.0.0.1',
      '--port',
      '8000',
    ], {
      cwd: backendPath,
      env: { ...process.env },
    });
    
    // Backend'in hazır olmasını bekle
    await this.waitForBackend();
  }
  
  async stop(): Promise<void> {
    if (this.process) {
      this.process.kill();
      this.process = null;
    }
  }
  
  private async waitForBackend(): Promise<void> {
    // Health check endpoint'ini poll et
    for (let i = 0; i < 30; i++) {
      try {
        const response = await fetch('http://localhost:8000/health');
        if (response.ok) return;
      } catch {}
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    throw new Error('Backend başlatılamadı');
  }
  
  private getPythonPath(): string {
    // Platform-specific Python path
    const isDev = process.env.NODE_ENV === 'development';
    if (isDev) {
      return 'python';
    }
    // Production'da bundled Python
    return path.join(__dirname, '../../python/python');
  }
}
```

## 🎨 Styling

### Tailwind CSS

Global stiller: `app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --primary: #6366f1;
  --secondary: #8b5cf6;
  --background: #0f172a;
  --surface: #1e293b;
  --text: #f1f5f9;
}

@layer components {
  .btn-primary {
    @apply bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition;
  }
  
  .card {
    @apply bg-surface rounded-xl p-6 shadow-lg;
  }
  
  .glass {
    @apply bg-white/10 backdrop-blur-lg border border-white/20;
  }
}
```

### Tailwind Config

**Dosya**: `tailwind.config.js`

```javascript
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6366f1',
        secondary: '#8b5cf6',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
};
```

## 🚀 Çalıştırma

### Development

```bash
# Dependencies yükle
npm install

# Next.js dev server
npm run dev

# Tarayıcıda aç
open http://localhost:3000
```

### Electron Development

```bash
# Next.js + Electron
npm run electron-dev
```

### Production Build

```bash
# Web build
npm run build
npm start

# Desktop app build
npm run electron-build

# Platform-specific
npm run electron-build -- --mac
npm run electron-build -- --win
npm run electron-build -- --linux
```

## 🧪 Testing

```bash
# Jest testleri
npm test

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage
```

## 📱 Responsive Design

Breakpoints:
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

```typescript
export function ResponsiveComponent() {
  return (
    <div className="
      grid 
      grid-cols-1 
      md:grid-cols-2 
      lg:grid-cols-3 
      gap-4
    ">
      {/* Content */}
    </div>
  );
}
```

## 📚 İlgili Dokümantasyon

- [Ana README](file:///Users/hakkiyuvanc/GİTHUB/relationship-ai/ili-kiyapayzekauygulamas-/README.md)
- [CODE_STRUCTURE.md](file:///Users/hakkiyuvanc/GİTHUB/relationship-ai/ili-kiyapayzekauygulamas-/CODE_STRUCTURE.md)
- [DEVELOPER_GUIDE.md](file:///Users/hakkiyuvanc/GİTHUB/relationship-ai/ili-kiyapayzekauygulamas-/DEVELOPER_GUIDE.md)
- [Backend README](file:///Users/hakkiyuvanc/GİTHUB/relationship-ai/ili-kiyapayzekauygulamas-/backend/README.md)

---

**Son Güncelleme**: 29 Aralık 2025
