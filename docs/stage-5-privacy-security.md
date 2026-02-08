# Aşama 5: Gizlilik ve Güvenlik (Privacy & Security)

## 5.1 Biyometrik Kilitleme (Biometric Lock)

### Özellikler

- **Face ID / Touch ID**: Electron app başlatıldığında otomatik kilitleme
- **Auto-Lock**: 5 dakika hareketsizlik sonrası otomatik kilitleme
- **Secure Storage**: Hassas veriler şifreli olarak saklanır

### Electron Entegrasyonu

```javascript
// electron/main.js
const { systemPreferences } = require("electron");

// Face ID / Touch ID kontrolü
async function authenticateUser() {
  try {
    const result = await systemPreferences.promptTouchID(
      "AMOR AI - Giriş Doğrulama",
    );
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// IPC Handler
ipcMain.handle("biometric-auth", async () => {
  return await authenticateUser();
});
```

### Frontend Kullanımı

```typescript
// components/BiometricLock.tsx
const unlockApp = async () => {
  const result = await window.electron.ipcRenderer.invoke("biometric-auth");
  if (result.success) {
    setIsLocked(false);
  }
};
```

---

## 5.2 Local-First Veri Saklama

### SQLite Veritabanı (Offline)

**Konum**: `~/.amor-ai/data.db`

**Tablolar**:

- `conversations`: Konuşma verileri
- `analyses`: Analiz sonuçları
- `user_preferences`: Kullanıcı tercihleri
- `encryption_keys`: Şifreleme anahtarları (keychain'de saklanır)

### Şifreleme

```python
# backend/app/services/encryption_service.py
from cryptography.fernet import Fernet

class EncryptionService:
    def __init__(self):
        self.key = self._get_or_create_key()
        self.cipher = Fernet(self.key)

    def encrypt_data(self, data: str) -> bytes:
        return self.cipher.encrypt(data.encode())

    def decrypt_data(self, encrypted: bytes) -> str:
        return self.cipher.decrypt(encrypted).decode()
```

### Veri Akışı

```
1. Kullanıcı konuşma yükler
   ↓
2. PII Masking (yerel)
   ↓
3. SQLite'a şifreli kaydet
   ↓
4. AI analizi için geçici olarak çöz
   ↓
5. Sonuçları şifreli kaydet
   ↓
6. Geçici verileri sil
```

---

## 5.3 Veri Silme ve Gizlilik

### Kullanıcı Kontrolleri

1. **Tek Analiz Silme**: Belirli bir analizi sil
2. **Tüm Verileri Sil**: Tüm konuşma ve analiz verilerini sil
3. **Uygulama Kaldırma**: Tüm veriler otomatik silinir

### GDPR Uyumluluğu

- ✅ Veri minimizasyonu (sadece gerekli veriler)
- ✅ Kullanıcı onayı (explicit consent)
- ✅ Silme hakkı (right to erasure)
- ✅ Veri taşınabilirliği (export JSON)
- ✅ Şeffaflık (privacy policy)

---

## 5.4 Güvenlik En İyi Uygulamaları

### Uygulama Seviyesi

```typescript
// Otomatik kilitleme
let inactivityTimer: NodeJS.Timeout;

const resetInactivityTimer = () => {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(
    () => {
      lockApp();
    },
    5 * 60 * 1000,
  ); // 5 dakika
};

window.addEventListener("mousemove", resetInactivityTimer);
window.addEventListener("keypress", resetInactivityTimer);
```

### Ağ Güvenliği

- ✅ HTTPS zorunlu
- ✅ Certificate pinning
- ✅ API key rotation
- ✅ Rate limiting

### Kod Güvenliği

- ✅ Input validation
- ✅ SQL injection koruması (ORM kullanımı)
- ✅ XSS koruması
- ✅ CSRF token'ları

---

## 5.5 Gizlilik Politikası Özeti

### Toplanan Veriler

- ❌ Kişisel kimlik bilgileri (isim, telefon, adres)
- ✅ Konuşma metinleri (PII maskelenmiş)
- ✅ Analiz sonuçları
- ✅ Kullanım istatistikleri (anonim)

### Veri Saklama

- **Konum**: Yerel cihaz (SQLite)
- **Şifreleme**: AES-256
- **Yedekleme**: Kullanıcı kontrolünde (iCloud/Google Drive opsiyonel)

### Üçüncü Taraf Paylaşımı

- ❌ Hiçbir üçüncü tarafla paylaşılmaz
- ✅ AI API'leri (OpenAI, Anthropic) geçici olarak kullanır
- ✅ API'lere gönderilen veriler PII-masked

---

## 5.6 Uygulama Checklist

### Geliştirme Aşaması

- [x] SQLite entegrasyonu
- [x] Encryption service
- [x] PII masking
- [ ] Biometric lock (Electron)
- [ ] Auto-lock timer
- [ ] Secure IPC

### Test Aşaması

- [ ] Penetration testing
- [ ] GDPR compliance audit
- [ ] Privacy policy review
- [ ] Security documentation

### Deployment Aşaması

- [ ] Code signing certificate
- [ ] Notarization (macOS)
- [ ] Windows Defender SmartScreen
- [ ] Privacy policy URL
