# İlişki Analiz AI - İnovasyon ve İyileştirme Todo Listesi

## 🚨 Kritik Öncelik (Hemen Başlanmalı)

### P0: Stabilizasyon
- [ ] **Turbopack Path Hatası Düzeltme**
  - [ ] `next.config.js` dosyasında webpack moduna geçiş yap
  - [ ] Alternatif: Next.js 16'dan 15'e downgrade (webpack varsayılan)
  - [ ] `turbopack.root` ayarını düzelt, tek lockfile kullan
  - [ ] Geçersiz config anahtarlarını temizle (`swcMinify`, `optimizeFonts`)
  - Neden: Frontend Turbopack panikleri nedeniyle development tamamen bloke

- [ ] **Electron Backend Spawn Düzeltme**
  - [ ] `backend-manager.js`: Python path için non-ASCII karakter kontrolü ekle
  - [ ] venv yoksa `python3 -m uvicorn` fallback ekle
  - [ ] Cross-platform path çözümleyici (Windows/Mac/Linux)
  - [ ] Backend başlatma hatalarında kullanıcıya anlamlı mesaj göster
  - Neden: Desktop uygulaması başlamıyor, ENOENT hatası

- [ ] **Lockfile ve Workspace Temizliği**
  - [ ] Üst dizindeki (`/Users/hakkiyuvanc/`) gereksiz `package-lock.json` sil
  - [ ] Proje root'unda tek lockfile bırak
  - [ ] `.gitignore` güncelle, yanlış yerlerdeki lockfile'ları dahil et

---

## 🔐 P1: Güvenlik ve Gizlilik

### Veri Koruma
- [ ] **PII Maskesi ve Minimizasyon**
  - [ ] Analiz öncesi telefon numarası, e-posta, adres pattern matching ve maskeleme
  - [ ] Hassas kelimeleri filtrele (şifre, kart numarası, kimlik no)
  - [ ] Backend log'larında PII scrubbing

- [ ] **Offline-Only Mod**
  - [ ] UI'da "Verilerim hiç gönderilmesin" toggle
  - [ ] Tamamen yerel analiz modu (API çağrısı yok)
  - [ ] Yerel şifreli depolama (Mac Keychain/Windows Credential Vault)
  - [ ] Kullanıcı tercihlerini `electron-store` ile sakla

- [ ] **Sentry Gizlilik İyileştirmesi**
  - [ ] `beforeSend` fonksiyonunu genişlet: tüm iletişim içeriğini kaldır
  - [ ] Error stack'lerinde path bilgilerini anonimleştir
  - [ ] PII detection library entegrasyonu (@microsoft/presidio veya benzeri)

- [ ] **Şeffaflık ve Rıza**
  - [ ] İlk kullanımda detaylı gizlilik onboarding ekranı
  - [ ] "Hangi veriler nerede saklanıyor?" bilgilendirme
  - [ ] Kullanıcı verilerini tamamen silme fonksiyonu (GDPR uyum)

---

## 🧪 P1: Test ve Kalite Altyapısı

### Test Coverage
- [ ] **E2E Test Altyapısı**
  - [ ] Playwright kurulumu ve konfigürasyonu
  - [ ] Electron app smoke test: açılış, backend bağlantı, temel analiz
  - [ ] Frontend unit testler: components, API calls
  - [ ] Backend API testler: pytest ile endpoint coverage

- [ ] **CI/CD Pipeline**
  - [ ] GitHub Actions workflow: lint, type-check, test
  - [ ] Multi-platform build matrix (macOS, Windows, Linux)
  - [ ] Automated release pipeline: build → sign → publish

- [ ] **Kalite Metrikleri**
  - [ ] Code coverage hedefi: %70+
  - [ ] Linting kuralları sıkılaştır (ESLint, Pylint)
  - [ ] TypeScript strict mode
  - [ ] Pre-commit hooks (husky): lint-staged, type-check

---

## 🎨 P2: Ürün Deneyimi İyileştirmesi

### UX ve Görselleştirme
- [ ] **Açıklanabilirlik (Explainability)**
  - [ ] Her metrik için "Neden bu skor?" açıklama kartı
  - [ ] Örnek cümle alıntıları: pozitif/negatif örnekler
  - [ ] Kategori bazlı kanıt gösterimi (emoji usage, conflict words, etc.)
  - [ ] Belirsizlik göstergesi: "Bu skorun güven aralığı ±X"

- [ ] **Görsel Zenginleştirme**
  - [ ] Chart.js ile trend grafikleri: zaman içinde metrik değişimi
  - [ ] Radar chart: 5 boyutta ilişki profili
  - [ ] Heatmap: günlük iletişim yoğunluğu ve ton
  - [ ] Progress bar animasyonları ve smooth transitions

- [ ] **Aksiyon Odaklı Öneriler**
  - [ ] Her kategori için 3-5 somut tavsiye
  - [ ] "Şunu dene" kartları: mikro-alışkanlık önerileri
  - [ ] Öneri tamamlama checkbox'ları ve haftalık takip
  - [ ] Gamification: tamamlanan öneriler için rozetler

- [ ] **Karanlık Mod**
  - [ ] Tailwind dark mode konfigürasyonu
  - [ ] Tüm componentlerde dark mode desteği
  - [ ] Electron menüde toggle

---

## 🤖 P2: ML ve NLP İyileştirmeleri

### Model Geliştirme
- [ ] **Türkçe NLP Pipeline Genişletme**
  - [ ] Zemberek veya TurkishNLP ile lemmatization
  - [ ] Named Entity Recognition: kişi, yer, organizasyon tespiti
  - [ ] Diyalog rol ataması: kim konuşuyor? (speaker diarization)
  - [ ] Intent classification: rica, şikayet, onay, red, soru

- [ ] **Duygu Analizi İyileştirmesi**
  - [ ] Çok-etiketli sınıflandırma: mutluluk, üzüntü, öfke, sürpriz eşzamanlı
  - [ ] Duygu yoğunluğu (intensity scoring)
  - [ ] Sarcasm/ironi tespiti (advanced)
  - [ ] Contextual sentiment: cümle bazlı değil diyalog bazlı

- [ ] **Model Kalibrasyon ve Değerlendirme**
  - [ ] Etiketli test seti oluştur (100-500 örnek)
  - [ ] Precision, recall, F1-score hesapla
  - [ ] Confusion matrix analizi
  - [ ] Calibration curve: predicted scores vs actual
  - [ ] A/B test framework: yeni metrik versiyonlarını karşılaştır

- [ ] **Belirsizlik Skorları**
  - [ ] Monte Carlo dropout ile uncertainty estimation
  - [ ] Bayesian approach veya ensemble models
  - [ ] UI'da "Bu sonuç %85 güvenilir" gösterimi

---

## 🚀 P3: İnovasyon Özellikleri

### Akıllı Koçluk Katmanı
- [ ] **Haftalık İletişim Koçluğu**
  - [ ] Her hafta analiz sonuçlarına göre kişiselleştirilmiş plan
  - [ ] "Bu hafta 3 empati cümlesi kullan" hedefleri
  - [ ] Push notification/hatırlatıcılar (Electron tray)
  - [ ] İlerleme takibi ve kutlama ekranı

- [ ] **Diyalog Yeniden Yazım Önerileri**
  - [ ] Kullanıcı örnek negatif cümle girer, AI pozitif alternatifleri önerir
  - [ ] Tone shifter: "Aşağıdaki mesajı daha empatik yap"
  - [ ] "Biz-dili" dönüştürücü: "Sen hep..." → "Biz beraber..."
  - [ ] OpenAI/Anthropic API entegrasyonu (opsiyonel, privacy uyarılı)

### Çoklu Kanal Entegrasyonu
- [ ] **Chat Export Parser'ları**
  - [ ] WhatsApp txt export parser
  - [ ] Telegram JSON export parser
  - [ ] Instagram/Messenger JSON handler
  - [ ] iMessage db reader (macOS)
  - [ ] Generic CSV/TXT format (timestamp, sender, message)

- [ ] **Otomatik PII Maskeleme**
  - [ ] Export dosyaları üzerinde automatic name anonymization
  - [ ] Phone/email pattern matching ve replace
  - [ ] "Anonim mod": tüm isimler "Kişi A", "Kişi B" olur

### Rapor ve Paylaşım
- [ ] **PDF Rapor Üretimi**
  - [ ] Puppeteer ile HTML → PDF rendering
  - [ ] Branded design: logo, renk paleti, typography
  - [ ] İstatistikler, grafikler, öneriler tam halinde
  - [ ] Watermark: "Generated by İlişki Analiz AI"

- [ ] **HTML Rapor**
  - [ ] Standalone HTML dosyası: offline açılabilir
  - [ ] Interactive charts (embedded Chart.js)
  - [ ] Yazdır düğmesi

- [ ] **Sosyal Paylaşım Kartları**
  - [ ] "İlişki skorum: 8.5/10" görseli oluştur
  - [ ] Canvas API ile custom image generation
  - [ ] Twitter/Instagram hikaye formatları

### Oyunlaştırma
- [ ] **Haftalık Puan Sistemi**
  - [ ] İletişim kalitesi puanı: günlük/haftalık grafikler
  - [ ] Seviye sistemi: "İletişim Çömezi" → "İletişim Ustası"
  - [ ] Rozetler: "7 gün üst üste pozitif ton", "50 empati cümlesi"

- [ ] **Çift Modu (Partner Mode)**
  - [ ] Her iki taraf da app kullanıyor: ortak skor panosu
  - [ ] Privacy-safe: sadece aggregate skorlar paylaşılır
  - [ ] "Birlikte hedef belirleyin" özelliği
  - [ ] Anonymous leaderboard: kullanıcılar opsiyonel olarak anonim ortalamayla karşılaştırabilir

### Gerçek Zamanlı Yardım
- [ ] **Canlı Yazım Asistanı**
  - [ ] Electron menüde "Mesajımı Analiz Et" kısayolu
  - [ ] Kullanıcı mesaj yazarken clipboard'dan okuma
  - [ ] Anlık ton analizi: "Bu mesaj agresif gelebilir"
  - [ ] Alternatif öneri gösterimi

- [ ] **Konuşma Simülatörü**
  - [ ] Kullanıcı senaryo girer: "Partnerimi şu konuda eleştirmek istiyorum"
  - [ ] AI farklı yaklaşımlar önerir (asertif, empatik, nötr)
  - [ ] Olası tepkileri simüle eder
  - [ ] "En iyi yaklaşım" önerisi

### Klinik/Uzman Yönlendirme
- [ ] **Güvenli Eşik Tespiti**
  - [ ] Çok yüksek çatışma skoru: uyarı göster
  - [ ] Toksik dil patterns: "Profesyonel destek alabilirsiniz" mesajı
  - [ ] Anonim kaynaklar listesi: terapi, danışmanlık hizmetleri
  - [ ] Kriz hattı numaraları (ulusal)

---

## 🌍 P3: Yerelleştirme ve Ölçeklenebilirlik

### Çoklu Dil Desteği
- [ ] **i18n Altyapısı**
  - [ ] react-i18next kurulumu
  - [ ] Türkçe, İngilizce, Almanca çevirileri
  - [ ] Backend i18n: analiz sonuçlarını kullanıcı diline göre döndür

- [ ] **NLP Multi-Language Support**
  - [ ] İngilizce için sentiment/empathy models
  - [ ] Language detection: otomatik dil tanıma
  - [ ] Language-specific metric weights

### Performance
- [ ] **Backend Optimizasyonu**
  - [ ] Redis cache layer: sık kullanılan analiz sonuçları
  - [ ] Async queue: büyük dosyalar için background processing (Celery)
  - [ ] Database indexing: user_id, created_at columns

- [ ] **Frontend Optimizasyonu**
  - [ ] Next.js lazy loading: route-based code splitting
  - [ ] Image optimization: WebP formatları
  - [ ] Service worker: offline-first PWA yaklaşımı

---

## 📊 P4: Analitik ve İzleme

### Product Analytics
- [ ] **Kullanıcı Davranış Takibi**
  - [ ] Privacy-safe analytics: PostHog self-hosted veya Plausible
  - [ ] Event tracking: analiz yapma, rapor indirme, özellik kullanımı
  - [ ] Funnel analysis: onboarding → first analysis → retention

### Business Metrics
- [ ] **KPI Dashboard**
  - [ ] DAU/WAU/MAU (günlük/haftalık/aylık aktif kullanıcı)
  - [ ] Average analysis per user
  - [ ] Premium conversion rate (eğer monetize edilirse)
  - [ ] User retention cohorts

---

## 💰 P4: Monetizasyon Stratejisi

### Freemium Model
- [ ] **Ücretsiz Katman**
  - [ ] Aylık 3 analiz limiti
  - [ ] Temel metrikler (sentiment, empathy, conflict)
  - [ ] Sınırlı rapor: PDF yok

- [ ] **Premium Katman ($4.99/ay)**
  - [ ] Sınırsız analiz
  - [ ] Gelişmiş metrikler (intent, NER, uncertainty scores)
  - [ ] PDF/HTML rapor export
  - [ ] Haftalık koçluk planı
  - [ ] Öncelikli destek

- [ ] **Ödeme Entegrasyonu**
  - [ ] Stripe Checkout: subscription management
  - [ ] Mac App Store In-App Purchase (macOS)
  - [ ] License key sistemi (Electron)

---

## 🎯 Sprint Planı (8 Haftalık Roadmap)

### Sprint 1-2: Stabilizasyon (2 hafta)
- Turbopack/Next.js düzeltme
- Electron backend spawn fix
- Test altyapısı kurulum
- PII maskeleme + offline mod

### Sprint 3-4: Ürün İyileştirme (2 hafta)
- Açıklanabilirlik kartları
- Görsel zenginleştirme (charts)
- WhatsApp/Telegram parser
- Türkçe NLP pipeline

### Sprint 5-6: İnovasyon Özellikleri (2 hafta)
- Haftalık koçluk planı
- Diyalog yeniden yazım
- PDF rapor üretimi
- Oyunlaştırma (rozetler, seviyeler)

### Sprint 7-8: Ölçeklendirme (2 hafta)
- i18n (İngilizce destek)
- Performance optimizasyonları
- Analytics + KPI dashboard
- Monetizasyon altyapısı

---

## 📝 Notlar

- **Gizlilik First**: Her özellikte "bu kullanıcı verilerini nasıl korur?" sorusunu sor
- **Incremental Value**: Her sprint sonunda kullanıcıya yeni değer sunulmalı
- **User Feedback Loop**: Erken kullanıcılardan geri bildirim al, roadmap'i güncelle
- **Technical Debt**: Her sprint'te %20 zaman debt temizliğine ayır

---

## 🔗 Referanslar

- [PRODUCTION_ROADMAP.md](./PRODUCTION_ROADMAP.md) - 8-Phase production plan
- [PHASE_1_COMPLETE.md](./PHASE_1_COMPLETE.md) - Desktop packaging progress
- [API_DOCS.md](./API_DOCS.md) - Backend API documentation
- [SECURITY.md](./SECURITY.md) - Security guidelines
