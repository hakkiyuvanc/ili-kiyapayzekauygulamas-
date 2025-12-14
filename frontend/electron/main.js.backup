const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const log = require('electron-log');
const AutoUpdater = require('./updater');
const { initSentry, captureError } = require('./sentry');
const BackendManager = require('./backend-manager');

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
