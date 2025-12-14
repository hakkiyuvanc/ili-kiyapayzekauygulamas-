# Tests

Bu dizin projenin unit testlerini içerir.

## Test Dosyaları

- `test_metrics.py` - İlişki metriklerinin testleri
- `test_report_generator.py` - Rapor oluşturucunun testleri  
- `test_parser.py` - Konuşma parser'ın testleri

## Testleri Çalıştırma

### Tüm testleri çalıştır
```bash
python tests/__init__.py
```

### Tek bir test dosyasını çalıştır
```bash
python tests/test_metrics.py
python tests/test_report_generator.py
python tests/test_parser.py
```

### pytest ile çalıştırma (opsiyonel)
```bash
pip install pytest
pytest tests/
```

## Test Kapsamı

### Metrik Testleri (test_metrics.py)
- ✅ Sentiment analizi (pozitif, negatif, nötr)
- ✅ Empati tespiti (kelimeler, emojiler)
- ✅ Çatışma analizi (indikatörler, büyük harf, ünlem)
- ✅ Biz-dili vs Ben/Sen-dili
- ✅ İletişim dengesi (dengeli, dengesiz, tek taraflı)
- ✅ Metrik etiketleri

### Rapor Oluşturucu Testleri (test_report_generator.py)
- ✅ Özet oluşturma
- ✅ İçgörü oluşturma
- ✅ Öneri oluşturma
- ✅ Genel skor hesaplama (0-10 skala)
- ✅ Rapor yapısı
- ✅ Text export formatı

### Parser Testleri (test_parser.py)
- ✅ Basit format parsing
- ✅ WhatsApp Android formatı
- ✅ WhatsApp iOS formatı
- ✅ Otomatik format tespiti
- ✅ Katılımcılara göre ayırma
- ✅ Boş metin işleme
- ✅ Tek katılımcı işleme

## Beklenen Çıktı

```
Test TestConversationParser ...
Test TestMetricLabels ...
Test TestRelationshipMetrics ...
Test TestReportGenerator ...
======================================================================
TEST SUMMARY
======================================================================
Tests run: 30+
Successes: 30+
Failures: 0
Errors: 0
======================================================================
```
