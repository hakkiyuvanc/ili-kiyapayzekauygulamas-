# İlişki Analiz AI - Desktop Uygulama

Bu proje bir **masaüstü uygulama** olarak tasarlanmıştır, web sitesi değildir.

## Teknoloji Stack

### Desktop App Seçenekleri

#### Opsiyon 1: Electron (Önerilen)
- **Avantajlar:**
  - Mevcut Next.js frontend'i kullanabilir
  - Cross-platform (Windows, macOS, Linux)
  - Zengin ekosistem
- **Kurulum:**
  ```bash
  cd frontend
  npm install electron electron-builder --save-dev
  npm install electron-is-dev
  ```

#### Opsiyon 2: Tauri (Hafif Alternatif)
- **Avantajlar:**
  - Çok küçük dosya boyutu
  - Rust backend
  - Daha hızlı başlatma
- **Kurulum:**
  ```bash
  npm install -D @tauri-apps/cli
  ```

## Electron ile Desktop App Oluşturma

### 1. Electron Main Process Dosyası

```javascript
// electron/main.js
const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../public/icon.png')
  });

  // Dev mode: Next.js dev server
  // Prod mode: Built Next.js
  const startUrl = isDev 
    ? 'http://localhost:3000' 
    : `file://${path.join(__dirname, '../out/index.html')}`;

  mainWindow.loadURL(startUrl);

  // Dev tools (sadece development)
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
```

### 2. Package.json Güncellemeleri

```json
{
  "name": "iliski-analiz-ai",
  "version": "1.0.0",
  "main": "electron/main.js",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "export": "next export",
    "electron": "electron .",
    "electron:dev": "concurrently \"npm run dev\" \"wait-on http://localhost:3000 && electron .\"",
    "electron:build": "npm run build && npm run export && electron-builder",
    "dist": "npm run electron:build"
  },
  "build": {
    "appId": "com.iliskianaliz.app",
    "productName": "İlişki Analiz AI",
    "files": [
      "out/**/*",
      "electron/**/*"
    ],
    "directories": {
      "output": "dist"
    },
    "mac": {
      "category": "public.app-category.productivity",
      "icon": "public/icon.icns"
    },
    "win": {
      "icon": "public/icon.ico"
    },
    "linux": {
      "icon": "public/icon.png",
      "category": "Office"
    }
  }
}
```

### 3. Next.js Static Export için yapılandırma

```javascript
// next.config.js
module.exports = {
  output: 'export', // Static HTML export
  images: {
    unoptimized: true // Electron için gerekli
  },
  // API routes kullanmıyorsak
  trailingSlash: true
};
```

### 4. Backend Entegrasyonu

Desktop uygulamada backend iki şekilde çalışabilir:

#### A) Embedded Backend (Önerilen)
Backend'i Electron ile birlikte paketleyin:

```javascript
// electron/backend.js
const { spawn } = require('child_process');
const path = require('path');

let backendProcess = null;

function startBackend() {
  const pythonPath = path.join(__dirname, '../backend/venv/bin/python');
  const backendPath = path.join(__dirname, '../backend');
  
  backendProcess = spawn(pythonPath, [
    '-m', 'backend.app.main'
  ], {
    cwd: backendPath
  });

  backendProcess.stdout.on('data', (data) => {
    console.log(`Backend: ${data}`);
  });

  backendProcess.on('close', (code) => {
    console.log(`Backend exited with code ${code}`);
  });
}

function stopBackend() {
  if (backendProcess) {
    backendProcess.kill();
  }
}

module.exports = { startBackend, stopBackend };
```

#### B) External Backend
Kullanıcı backend'i ayrı başlatır (development için uygun).

### 5. Yapılandırma Dosyası

```javascript
// electron/config.js
module.exports = {
  backend: {
    url: process.env.BACKEND_URL || 'http://localhost:8000',
    autoStart: true
  },
  ai: {
    enabled: true,
    provider: process.env.AI_PROVIDER || 'openai'
  }
};
```

## Geliştirme Workflow

### Development
```bash
# Terminal 1: Backend
cd backend
source venv/bin/activate
python -m backend.app.main

# Terminal 2: Frontend + Electron
cd frontend
npm run electron:dev
```

### Production Build
```bash
# 1. Backend build (PyInstaller ile)
cd backend
pip install pyinstaller
pyinstaller --onefile --name iliski-backend backend/app/main.py

# 2. Frontend + Electron build
cd frontend
npm run electron:build

# Çıktı: dist/ klasöründe .dmg, .exe, .AppImage
```

## AI Özelliklerini Test Etme

### .env dosyası oluştur
```bash
cp .env.example .env
```

### API anahtarlarını ekle
```env
AI_ENABLED=true
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...your-key...
```

### Test
```bash
# Backend'i başlat
python -m backend.app.main

# Başka terminalde
curl -X POST http://localhost:8000/api/analysis/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Ali: Merhaba canım\nAyşe: Merhaba aşkım",
    "format_type": "simple"
  }'
```

## Özellikler

### ✅ Tamamlanan
- [x] Backend API (FastAPI)
- [x] 5 Analiz metriği (duygu, empati, çatışma, biz-dili, denge)
- [x] Frontend UI (Next.js + Tailwind)
- [x] AI Servisi (OpenAI/Anthropic)
- [x] Rule-based fallback
- [x] Veritabanı (SQLite/PostgreSQL)
- [x] Authentication (JWT)

### 🚧 Desktop App İçin Gerekli
- [ ] Electron main process
- [ ] Electron preload script
- [ ] Backend auto-start
- [ ] App icons (.icns, .ico, .png)
- [ ] Electron builder config
- [ ] Auto-updater
- [ ] System tray integration
- [ ] Local storage migration

### 🎯 Gelecek Özellikler
- [ ] Offline mode
- [ ] Local AI model support (llama.cpp)
- [ ] Export to PDF
- [ ] Push notifications
- [ ] Dark mode
- [ ] Multi-language support

## Platform-Specific Notes

### macOS
- Notarization gerekli (App Store dışı dağıtım)
- Code signing sertifikası

### Windows
- Code signing sertifikası (opsiyonel ama önerilen)
- Installer wizard (NSIS)

### Linux
- AppImage (portable)
- .deb / .rpm (repository dağıtımı)

## Dağıtım

### GitHub Releases
```bash
npm run dist
# dist/ klasöründeki dosyaları GitHub Releases'e yükle
```

### Auto-update
```javascript
// electron/updater.js
const { autoUpdater } = require('electron-updater');

autoUpdater.checkForUpdatesAndNotify();
```

## Lisanslama

Desktop uygulama olarak:
- Ücretli lisans modeli
- Subscription (aylık/yıllık)
- One-time purchase
- Freemium (sınırlı özellikler ücretsiz)

## Support

Desktop app için:
- Email: support@iliskianaliz.ai
- In-app feedback form
- Crash reporting (Sentry)
