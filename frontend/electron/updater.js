const { autoUpdater } = require('electron-updater');
const { dialog } = require('electron');
const log = require('electron-log');

// Configure logger
log.transports.file.level = 'info';
autoUpdater.logger = log;

class AutoUpdater {
  constructor(mainWindow) {
    this.mainWindow = mainWindow;
    this.setupUpdater();
  }

  setupUpdater() {
    // Disable auto-download (we'll ask user first)
    autoUpdater.autoDownload = false;

    // Check for updates on startup (after 5 seconds)
    setTimeout(() => {
      if (process.env.NODE_ENV === 'production') {
        this.checkForUpdates();
      }
    }, 5000);

    // Update available
    autoUpdater.on('update-available', (info) => {
      log.info('Update available:', info);
      
      dialog.showMessageBox(this.mainWindow, {
        type: 'info',
        title: 'Güncelleme Mevcut',
        message: `Yeni versiyon mevcut: ${info.version}`,
        detail: 'Şimdi indirmek ister misiniz?',
        buttons: ['İndir', 'Daha Sonra'],
        defaultId: 0,
        cancelId: 1
      }).then((result) => {
        if (result.response === 0) {
          autoUpdater.downloadUpdate();
          this.showDownloadProgress();
        }
      });
    });

    // No update available
    autoUpdater.on('update-not-available', (info) => {
      log.info('Update not available:', info);
    });

    // Download progress
    autoUpdater.on('download-progress', (progressObj) => {
      const percent = progressObj.percent.toFixed(1);
      log.info(`Download progress: ${percent}%`);
      
      // Send progress to renderer
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        this.mainWindow.webContents.send('download-progress', {
          percent: percent,
          transferred: progressObj.transferred,
          total: progressObj.total
        });
      }
    });

    // Update downloaded
    autoUpdater.on('update-downloaded', (info) => {
      log.info('Update downloaded:', info);
      
      dialog.showMessageBox(this.mainWindow, {
        type: 'info',
        title: 'Güncelleme Hazır',
        message: 'Güncelleme indirildi ve yüklemeye hazır.',
        detail: 'Uygulamayı yeniden başlatarak güncelleyin.',
        buttons: ['Şimdi Yeniden Başlat', 'Daha Sonra'],
        defaultId: 0,
        cancelId: 1
      }).then((result) => {
        if (result.response === 0) {
          // Quit and install update
          autoUpdater.quitAndInstall(false, true);
        }
      });
    });

    // Error handling
    autoUpdater.on('error', (error) => {
      log.error('Update error:', error);
      
      // Don't show error dialog for network issues during automatic checks
      if (error.message.includes('net::ERR')) {
        log.warn('Network error during update check (silent)');
        return;
      }
      
      dialog.showMessageBox(this.mainWindow, {
        type: 'error',
        title: 'Güncelleme Hatası',
        message: 'Güncelleme sırasında bir hata oluştu.',
        detail: error.message,
        buttons: ['Tamam']
      });
    });
  }

  checkForUpdates() {
    log.info('Checking for updates...');
    autoUpdater.checkForUpdates();
  }

  showDownloadProgress() {
    // You can show a custom download progress window here
    // For now, we'll just send events to the renderer
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send('update-downloading');
    }
  }

  // Manual check (called from menu or renderer)
  manualCheckForUpdates() {
    log.info('Manual update check triggered');
    
    autoUpdater.checkForUpdates().then((result) => {
      if (!result || !result.updateInfo) {
        dialog.showMessageBox(this.mainWindow, {
          type: 'info',
          title: 'Güncelleme Yok',
          message: 'Uygulamanız güncel.',
          detail: `Mevcut versiyon: ${require('../../package.json').version}`,
          buttons: ['Tamam']
        });
      }
    }).catch((error) => {
      log.error('Manual update check error:', error);
      dialog.showMessageBox(this.mainWindow, {
        type: 'error',
        title: 'Güncelleme Kontrolü Başarısız',
        message: 'Güncellemeler kontrol edilemedi.',
        detail: error.message,
        buttons: ['Tamam']
      });
    });
  }
}

module.exports = AutoUpdater;
