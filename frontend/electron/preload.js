const { contextBridge, ipcRenderer } = require('electron');

// Renderer process'e güvenli API'ler sağla
contextBridge.exposeInMainWorld('electronAPI', {
  // Backend URL al
  getBackendUrl: () => ipcRenderer.invoke('get-backend-url'),

  // Backend health check
  checkBackendHealth: () => ipcRenderer.invoke('check-backend-health'),

  // Platform bilgisi
  platform: process.platform,

  // Database API
  saveAnalysis: (data) => ipcRenderer.invoke('save-analysis', data),
  getHistory: (limit, offset) => ipcRenderer.invoke('get-history', limit, offset),
  getAnalysisDetail: (id) => ipcRenderer.invoke('get-analysis-detail', id),
  deleteAnalysis: (id) => ipcRenderer.invoke('delete-analysis', id),

  // ─── Güvenli API Key Saklama ───────────────────────────────────────────────
  // macOS Keychain / Windows Credential Manager / GNOME Keyring üzerinden
  // saklar. keytar yoksa main.js'deki in-memory haritaya düşer.
  secureStore: {
    /**
     * Kayıtlı API key'i getir
     * @param {string} account - Örn: 'openai', 'gemini', 'anthropic'
     * @returns {Promise<string|null>}
     */
    get: (account) => ipcRenderer.invoke('secure-get', account),

    /**
     * API key'i güvenli şekilde kaydet
     * @param {string} account
     * @param {string} value
     * @returns {Promise<boolean>}
     */
    set: (account, value) => ipcRenderer.invoke('secure-set', account, value),

    /**
     * Kayıtlı key'i sil
     * @param {string} account
     * @returns {Promise<boolean>}
     */
    delete: (account) => ipcRenderer.invoke('secure-delete', account),
  },

  // Versiyon bilgisi
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron
  }
});
