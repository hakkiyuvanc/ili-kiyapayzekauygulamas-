const { contextBridge, ipcRenderer } = require('electron');

// Renderer process'e güvenli API'ler sağla
contextBridge.exposeInMainWorld('electronAPI', {
  // Backend URL al
  getBackendUrl: () => ipcRenderer.invoke('get-backend-url'),
  
  // Backend health check
  checkBackendHealth: () => ipcRenderer.invoke('check-backend-health'),
  
  // Platform bilgisi
  platform: process.platform,
  
  // Versiyon bilgisi
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron
  }
});
