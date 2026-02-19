const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const log = require('electron-log');
const AutoUpdater = require('./updater');
const { initSentry, captureError } = require('./sentry');
const BackendManager = require('./backend-manager');
const localDb = require('./database');

// keytar — Sistem Keychain entegrasyonu (macOS Keychain, Windows Credential Manager, GNOME Keyring)
// Opsiyonel: build edilmemişse graceful fallback
let keytar = null;
try {
  keytar = require('keytar');
  log.info('keytar loaded — secure storage available');
} catch (e) {
  log.warn('keytar not available, falling back to in-memory storage:', e.message);
}

// keytar erişilemiyorsa bellek tabanlı fallback (uygulama yeniden başlayınca temizlenir)
const inMemoryKeyStore = new Map();

const KEYCHAIN_SERVICE = 'amor-iliski-ai';

// Configure logging
log.transports.file.level = 'info';
log.info('App starting...');
log.info('isDev:', isDev);
log.info('App version:', app.getVersion());

// Initialize Sentry for crash reporting
initSentry(isDev);

let mainWindow;
let backendManager;

// Ana pencere oluştur
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../public/icon.png'),
    backgroundColor: '#ffffff',
    titleBarStyle: 'default',
    show: false // Hazır olana kadar gizle
  });

  // Pencere hazır olunca göster
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // URL yükle
  const startUrl = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../out/index.html')}`;

  mainWindow.loadURL(startUrl);

  // Development mode'da DevTools aç
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Pencere kapatıldığında
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App hazır olduğunda
app.whenReady().then(async () => {
  try {
    // Initialize database
    localDb.init();

    // Initialize backend manager
    backendManager = new BackendManager();

    // Backend'i başlat
    await backendManager.start();

    // Pencereyi oluştur
    await createWindow();

    // Initialize auto-updater (production only)
    if (!isDev) {
      const updater = new AutoUpdater(mainWindow);

      // Add "Check for Updates" to menu
      const template = [
        {
          label: 'İlişki Analiz AI',
          submenu: [
            {
              label: `Versiyon ${app.getVersion()}`,
              enabled: false
            },
            { type: 'separator' },
            {
              label: 'Güncellemeleri Kontrol Et',
              click: () => {
                updater.manualCheckForUpdates();
              }
            },
            { type: 'separator' },
            { role: 'quit', label: 'Çıkış' }
          ]
        },
        {
          label: 'Düzenle',
          submenu: [
            { role: 'undo', label: 'Geri Al' },
            { role: 'redo', label: 'Yinele' },
            { type: 'separator' },
            { role: 'cut', label: 'Kes' },
            { role: 'copy', label: 'Kopyala' },
            { role: 'paste', label: 'Yapıştır' },
            { role: 'selectAll', label: 'Tümünü Seç' }
          ]
        },
        {
          label: 'Görünüm',
          submenu: [
            { role: 'reload', label: 'Yenile' },
            { role: 'toggleDevTools', label: 'Geliştirici Araçları' },
            { type: 'separator' },
            { role: 'resetZoom', label: 'Yakınlaştırmayı Sıfırla' },
            { role: 'zoomIn', label: 'Yakınlaştır' },
            { role: 'zoomOut', label: 'Uzaklaştır' },
            { type: 'separator' },
            { role: 'togglefullscreen', label: 'Tam Ekran' }
          ]
        },
        {
          label: 'Yardım',
          submenu: [
            {
              label: 'Dokümantasyon',
              click: async () => {
                const { shell } = require('electron');
                await shell.openExternal('https://github.com/hakkiyuvanc/ili-kiyapayzekauygulamas-');
              }
            },
            {
              label: 'Destek',
              click: async () => {
                const { shell } = require('electron');
                await shell.openExternal('mailto:destek@iliskianaliz.com');
              }
            }
          ]
        }
      ];

      const menu = Menu.buildFromTemplate(template);
      Menu.setApplicationMenu(menu);

      log.info('Auto-updater initialized');
    } else {
      log.info('Skipping auto-updater in development mode');
    }
  } catch (error) {
    log.error('Failed to start application:', error);
    console.error('Failed to start application:', error);
  }
});

// Tüm pencereler kapatıldığında
app.on('window-all-closed', () => {
  if (backendManager) {
    backendManager.stop();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// macOS'ta aktif olduğunda
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Uygulama kapanırken
app.on('before-quit', () => {
  if (backendManager) {
    backendManager.stop();
  }
});

// IPC handlers
ipcMain.handle('get-backend-url', () => {
  return backendManager ? backendManager.getUrl() : 'http://localhost:8000';
});

ipcMain.handle('check-backend-health', async () => {
  if (backendManager) {
    return await backendManager.checkHealth();
  }
  return false;
});

// Database IPC handlers
ipcMain.handle('save-analysis', (event, data) => {
  try {
    return localDb.saveAnalysis(data);
  } catch (error) {
    log.error('IPC save-analysis error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-history', (event, limit, offset) => {
  try {
    return localDb.getHistory(limit, offset);
  } catch (error) {
    log.error('IPC get-history error:', error);
    return [];
  }
});

ipcMain.handle('get-analysis-detail', (event, id) => {
  try {
    return localDb.getAnalysis(id);
  } catch (error) {
    log.error('IPC get-analysis-detail error:', error);
    return null;
  }
});

ipcMain.handle('delete-analysis', (event, id) => {
  try {
    return localDb.deleteAnalysis(id);
  } catch (error) {
    log.error('IPC delete-analysis error:', error);
    return false;
  }
});

// ─── Güvenli Key Saklama (keytar / in-memory fallback) ───────────────────────

/**
 * secure-get: Sistem Keychain'den API key'i al
 * @param {string} account - Örn: 'openai', 'gemini'
 * @returns {string|null} Kayıtlı key veya null
 */
ipcMain.handle('secure-get', async (event, account) => {
  if (keytar) {
    try {
      return await keytar.getPassword(KEYCHAIN_SERVICE, account);
    } catch (e) {
      log.error('keytar.getPassword failed:', e.message);
    }
  }
  return inMemoryKeyStore.get(account) ?? null;
});

/**
 * secure-set: API key'i Keychain'e kaydet
 * @param {string} account - Örn: 'openai'
 * @param {string} value   - API key değeri
 */
ipcMain.handle('secure-set', async (event, account, value) => {
  if (keytar) {
    try {
      await keytar.setPassword(KEYCHAIN_SERVICE, account, value);
      log.info(`secure-set: key stored for '${account}'`);
      return true;
    } catch (e) {
      log.error('keytar.setPassword failed:', e.message);
    }
  }
  // Fallback: bellek
  inMemoryKeyStore.set(account, value);
  return true;
});

/**
 * secure-delete: Kayıtlı key'i sil
 * @param {string} account - Örn: 'openai'
 */
ipcMain.handle('secure-delete', async (event, account) => {
  if (keytar) {
    try {
      const deleted = await keytar.deletePassword(KEYCHAIN_SERVICE, account);
      log.info(`secure-delete: '${account}' deleted=${deleted}`);
      return deleted;
    } catch (e) {
      log.error('keytar.deletePassword failed:', e.message);
    }
  }
  inMemoryKeyStore.delete(account);
  return true;
});
