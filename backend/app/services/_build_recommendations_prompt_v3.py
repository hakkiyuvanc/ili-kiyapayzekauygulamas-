    def _build_recommendations_prompt_v3(self, metrics: dict[str, Any], insights: list[dict]) -> str:
        """Öneri promptu oluştur (V3.0 - Strict JSON Schema)"""

        # Context optimization: Top insights only
        top_insights = insights[:4] if len(insights) > 4 else insights

        return f"""Sen bir ilişki koçusun. Aşağıdaki içgörülere ve metriklere göre somut, uygulanabilir öneriler oluştur.

İÇGÖRÜLER:
{json.dumps(top_insights, indent=2, ensure_ascii=False)}

METRİKLER:
- Empati skoru: {metrics.get('empathy', {}).get('score', 'N/A')}
- Çatışma skoru: {metrics.get('conflict', {}).get('score', 'N/A')}
- Biz-dili skoru: {metrics.get('we_language', {}).get('score', 'N/A')}

GÖREV:
Yukarıdaki içgörülere dayanarak 4-5 adet somut, uygulanabilir öneri üret.

ÖNERİ KATEGORİLERİ:
- "İletişim": İletişim becerilerini geliştirme
- "Empati": Empati ve anlayış artırma
- "Çatışma Yönetimi": Anlaşmazlıkları sağlıklı yönetme
- "Bağ Güçlendirme": İlişkiyi derinleştirme

KURALLAR:
- Her öneri için category, title, description, difficulty alanları zorunlu
- title: Max 50 karakter, eyleme yönelik
- description: 50-200 karakter arası, somut adımlar içermeli
- difficulty: "Düşük", "Orta", veya "Yüksek"

ÇIKTI FORMATI:
{{
  "recommendations": [
    {{
      "category": "İletişim",
      "title": "Günlük Check-in Rutini",
      "description": "Her gün 10 dakika telefonlar kapalı konuşun. Sadece dinleyin ve 'Anlıyorum' deyin.",
      "difficulty": "Düşük"
    }},
    {{
      "category": "Empati",
      "title": "Duygu Yansıtma Pratiği",
      "description": "Karşınızın söylediklerini kendi cümlelerinizle tekrarlayın. 'Senin için bu zor olmalı' gibi.",
      "difficulty": "Orta"
    }},
    {{
      "category": "Bağ Güçlendirme",
      "title": "Ortak Hedefler Belirleyin",
      "description": "'Bizim için ne iyi?' sorusunu sorun. Haftalık bir 'biz' planı yapın ve birlikte karar alın.",
      "difficulty": "Orta"
    }}
  ]
}}"""
