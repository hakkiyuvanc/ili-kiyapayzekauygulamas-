# ✅ Test Kontrol Listesi

## 🎯 Temel İşlevsellik

### 1. Dashboard Screen
- [ ] Sayfa yükleniyor mu?
- [ ] Skeleton loader görünüyor mu? (ilk 800ms)
- [ ] Dark mode toggle çalışıyor mu?
- [ ] Pro'ya Geç butonu var mı?
- [ ] İstatistik kartları görünüyor mu?
- [ ] "Yeni Analiz Başlat" butonu çalışıyor mu?
- [ ] Geçmiş analizler listesi görünüyor mu?

### 2. Analysis Type Screen
- [ ] 3 analiz tipi görünüyor mu?
  - [ ] Mesaj Analizi ✅
  - [ ] Dosya Analizi 🔒 (Pro badge)
  - [ ] İlişki Değerlendirmesi ✅
- [ ] Toast bildirimi çıkıyor mu? (analiz seçildiğinde)
- [ ] Pro özellik uyarısı çalışıyor mu?

### 3. Message Analysis Screen
- [ ] Geri butonu çalışıyor mu?
- [ ] Mesaj yönü seçimi çalışıyor mu? (📥 Aldığım / 📤 Göndereceğim)
- [ ] "Yapıştır" butonu çalışıyor mu?
- [ ] Karakter sayacı görünüyor mu?
- [ ] Validation mesajları çıkıyor mu?
  - [ ] 10 karakterden az → Hata
  - [ ] 10-1000 karakter → Yeşil tik
  - [ ] 1000+ karakter → Kırmızı
- [ ] Progress bar renk değiştiriyor mu?
- [ ] "Analizi Başlat" butonu enable/disable oluyor mu?

### 4. Question Screen (Relationship Assessment)
- [ ] Progress tracker görünüyor mu?
- [ ] Soru numarası doğru gösteriliyor mu? (S1, S2, ...)
- [ ] Seçenekler tıklanabiliyor mu?
- [ ] Otomatik geçiş yapıyor mu? (300ms)
- [ ] Geri butonu çalışıyor mu?
- [ ] Kompakt progress bar görünüyor mu?

### 5. Processing Screen
- [ ] Beyin ikonu animasyonu var mı?
- [ ] Tip-specific adımlar gösteriliyor mu?
  - [ ] Message: 4 adım
  - [ ] File: 5 adım
  - [ ] Relationship: 4 adım
- [ ] Emoji iconlar görünüyor mu?
- [ ] "Analiz başlatılıyor..." toast çıktı mı?

### 6. Insights Screen
- [ ] Skeleton loader görünüyor mu? (ilk 600ms)
- [ ] Genel skor doğru gösteriliyor mu?
- [ ] Skor rengi doğru mu?
  - [ ] 75+ → Yeşil
  - [ ] 50-74 → Sarı
  - [ ] <50 → Kırmızı
- [ ] Radar chart görünüyor mu?
- [ ] Tab geçişi çalışıyor mu? (Genel / Detaylar)
- [ ] Paylaş butonu çalışıyor mu?
  - [ ] Clipboard'a kopyalıyor mu?
  - [ ] Tik ikonu görünüyor mu? (2 saniye)
- [ ] İndir butonu çalışıyor mu? (Pro üyeler için)
  - [ ] TXT dosyası indiriliyor mu?
- [ ] "Analiz tamamlandı!" toast çıktı mı?

### 7. Subscription Screen
- [ ] Pro planlar görünüyor mu?
- [ ] Özellik listesi doğru mu?
- [ ] "Pro'ya Geç" butonu çalışıyor mu?
- [ ] "Pro üyeliğiniz aktif!" toast çıktı mı?

## 🎨 UI/UX Özellikleri

### Dark Mode
- [ ] Toggle butonu her sayfada görünüyor mu?
- [ ] Tema değişimi smooth mu?
- [ ] Tüm componentler dark mode'da doğru görünüyor mu?
- [ ] LocalStorage'a kaydediliyor mu?

### Toast Bildirimleri
- [ ] Farklı tipler çalışıyor mu?
  - [ ] ✅ Success (yeşil)
  - [ ] ❌ Error (kırmızı)
  - [ ] ℹ️ Info (mavi)
  - [ ] ⚠️ Warning (sarı)
- [ ] Otomatik kapanıyor mu? (5 saniye)
- [ ] Manuel kapatılabiliyor mu? (X butonu)
- [ ] Animasyonlar smooth mu?

### Animasyonlar
- [ ] Fade in animasyonu çalışıyor mu?
- [ ] Slide animasyonları smooth mu?
- [ ] Hover efektleri çalışıyor mu?
- [ ] Scale animasyonu çalışıyor mu?
- [ ] Shimmer efekti skeleton'larda var mı?

### Responsive Design
- [ ] Mobil görünüm düzgün mü?
- [ ] Tablet görünüm düzgün mü?
- [ ] Desktop görünüm düzgün mü?
- [ ] Scroll çalışıyor mu?

## 🐛 Bilinen Sorunlar

### Düzeltilmesi Gerekenler
- [ ] Port 3000 zaten kullanımda (3001'e geçildi) ✅
- [ ] Git user config uyarısı (önemli değil) ℹ️

### Potansiyel İyileştirmeler
- [ ] Backend API entegrasyonu
- [ ] Gerçek AI analiz motoru
- [ ] Kullanıcı authentication
- [ ] Database integration
- [ ] File upload endpoint
- [ ] PDF export (jsPDF)
- [ ] Image optimization
- [ ] PWA özellikleri

## 🚀 Test Adımları

### Manuel Test
1. **Dashboard** → "Yeni Analiz Başlat"
2. **Analysis Type** → "Mesaj Analizi" seç
3. **Message Analysis** → Mesaj yaz (örn: "Merhaba nasılsın? Bugün buluşabilir miyiz?")
4. **Processing** → Bekle (2-3 saniye)
5. **Insights** → Sonuçları incele
6. **Share/Download** → Test et
7. **Dark Mode** → Toggle et
8. **Pro Upgrade** → Test et

### Hızlı Test Senaryoları

#### Senaryo 1: Mesaj Analizi (Happy Path)
```
1. Dashboard açılır
2. "Yeni Analiz Başlat" tıkla
3. "Mesaj Analizi" seç
4. "Merhaba canım, seni çok özledim ❤️" yaz
5. "📥 Aldığım Mesaj" seç
6. "Analizi Başlat" tıkla
7. Sonuçları gör
8. Paylaş butonunu test et
```

#### Senaryo 2: Validasyon Testi
```
1. Mesaj Analizi ekranına git
2. Sadece "test" yaz (4 karakter)
3. Hata mesajını gör: "Mesaj en az 10 karakter olmalıdır"
4. Çok uzun metin yapıştır (1000+ karakter)
5. Hata mesajını gör: "Mesaj en fazla 1000 karakter olabilir"
```

#### Senaryo 3: Dark Mode Testi
```
1. Dashboard'da Dark Mode toggle'a tıkla
2. Tema değişsin
3. Mesaj Analizi'ne git
4. Insights'a git
5. Tüm sayfalarda dark mode çalışsın
6. Sayfayı yenile
7. Dark mode korunmuş olsun (LocalStorage)
```

#### Senaryo 4: Pro Özellik Testi
```
1. Analysis Type'da "Dosya Analizi" seç
2. Warning toast çıksın: "Bu özellik Pro üyelere özeldir"
3. "Pro'ya Geç" butonuna tıkla
4. Subscription ekranı açılsın
5. "Hemen Başla" tıkla
6. Success toast: "Pro üyeliğiniz aktif!"
7. Dashboard'a dön
8. "Pro Üye" badge'i görünsün
```

## 📊 Performans Metrikleri

- [ ] İlk yükleme < 2 saniye
- [ ] Sayfa geçişleri < 500ms
- [ ] Toast animasyonları smooth (60fps)
- [ ] Skeleton loader animasyonları smooth
- [ ] Dark mode geçişi < 300ms

## ✅ Test Sonucu

**Tarih**: _____________  
**Tester**: _____________  
**Versiyon**: 1.0.0  

**Genel Durum**: 
- [ ] Tüm testler geçti ✅
- [ ] Bazı sorunlar var ⚠️
- [ ] Major sorunlar var ❌

**Notlar**:
_____________________________________________
_____________________________________________
_____________________________________________
