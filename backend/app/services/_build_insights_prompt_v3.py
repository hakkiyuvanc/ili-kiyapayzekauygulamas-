    def _build_insights_prompt_v3(self, metrics: dict[str, Any], summary: str) -> str:
        """İçgörü promptu oluştur (V3.0 - Strict JSON Schema)"""

        # Context optimization
        top_metrics = {
            "sentiment": metrics.get("sentiment", {}),
            "empathy": metrics.get("empathy", {}),
            "conflict": metrics.get("conflict", {}),
            "we_language": metrics.get("we_language", {}),
        }

        # RAG: Get relevant knowledge
        knowledge = get_relevant_knowledge(metrics)
        knowledge_context = format_knowledge_context(knowledge)

        return f"""Sen bir ilişki psikoloğusun. Aşağıdaki konuşma analizine göre derinlemesine içgörüler üret.

{knowledge_context}

METRİKLER:
{json.dumps(top_metrics, indent=2, ensure_ascii=False)}

KONUŞMA ÖZETİ:
{summary}

GÖREV:
Yukarıdaki metriklere ve psikoloji bilgilerine dayanarak 4-6 adet içgörü üret.

İÇGÖRÜ KATEGORİLERİ:
- "Güçlü Yön": İlişkinin pozitif yönleri
- "Gelişim Alanı": İyileştirilebilecek noktalar
- "Dikkat Noktası": Dikkat edilmesi gereken riskler

KURALLAR:
- Her içgörü için category, title, description, icon alanları zorunlu
- title: Max 50 karakter, öz ve net
- description: 50-200 karakter arası, empatik ve destekleyici ton
- icon: İlgili emoji (örn: ✅, 💡, ⚠️, 💝)

ÇIKTI FORMATI:
{{
  "insights": [
    {{
      "category": "Güçlü Yön",
      "title": "Yüksek Empati Seviyesi",
      "description": "İletişimde karşınızı anlamaya yönelik güçlü çaba var. Bu, ilişkide güven ve yakınlık oluşturmanın temel taşıdır.",
      "icon": "💝"
    }},
    {{
      "category": "Gelişim Alanı",
      "title": "Biz-dili Kullanımı",
      "description": "Bireysel ifadeler ağırlıkta. 'Biz', 'birlikte' gibi kelimeler kullanarak ortaklık hissini güçlendirebilirsiniz.",
      "icon": "💡"
    }}
  ]
}}"""
