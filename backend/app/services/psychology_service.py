"""Psikolojik Profil Servisi

Konuşma metninden:
- Bağlanma Stili (Attachment Style): Kaygılı / Kaçıngan / Güvenli
- Sevgi Dili (Love Language): 5 Sevgi Dilinden tahmini

Hibrit yaklaşım:
  1. Kural tabanlı keyword scoring (AI olmadan da çalışır)
  2. LLM ile zenginleştirilmiş açıklama (AI varsa)
"""

import logging
from typing import Any

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Attachment Style (Bağlanma Stili)
# ---------------------------------------------------------------------------


class AttachmentStyleAnalyzer:
    """
    Bowlby & Ainsworth'un Bağlanma Teorisine dayalı stil tahmini.

    Üç stil:
    - Kaygılı (Anxious/Preoccupied): Terk edilme korkusu, onay arayışı
    - Kaçıngan (Avoidant/Dismissing): Duygusal mesafe, bağımsızlık vurgusu
    - Güvenli (Secure): Dengeli iletişim, açık duygu ifadesi
    """

    # Türkçe sinyal kelimeleri — her stil için ağırlıklı listeler
    ANXIOUS_SIGNALS = {
        # Terk edilme / onay arayışı
        "neden cevap vermiyorsun": 3,
        "neredeydin": 2,
        "beni umursamıyorsun": 3,
        "beni sevmiyor musun": 3,
        "bırakacak mısın": 3,
        "gidecek misin": 2,
        "cevap ver": 2,
        "neden görmezden geliyorsun": 3,
        "hep böyle yapıyorsun": 2,
        "asla": 1,
        "her zaman": 1,
        "hiç": 1,
        "yalnız bırakma": 3,
        "lütfen": 1,
        "özür dilerim": 1,
        "kızgın mısın": 2,
        "bana kızıyor musun": 2,
        "ne düşünüyorsun": 1,
        "söyle bana": 1,
        "merak ediyorum": 1,
    }

    AVOIDANT_SIGNALS = {
        # Duygusal mesafe / bağımsızlık
        "bırak beni": 3,
        "rahat bırak": 3,
        "boğuyorsun": 3,
        "nefes alamıyorum": 2,
        "kendi işine bak": 3,
        "fazla takıntılısın": 3,
        "abartıyorsun": 2,
        "drama yapma": 2,
        "şu an konuşmak istemiyorum": 2,
        "sonra konuşuruz": 2,
        "meşgulüm": 1,
        "iş var": 1,
        "zaman lazım": 2,
        "alan lazım": 2,
        "bağımsız": 1,
        "kendi başıma": 1,
        "gerek yok": 1,
        "önemli değil": 1,
        "fark etmez": 1,
        "nasıl olsa": 1,
    }

    SECURE_SIGNALS = {
        # Açık iletişim / duygusal denge
        "seninle konuşmak istiyorum": 3,
        "nasıl hissediyorsun": 2,
        "seni anlıyorum": 2,
        "birlikte çözelim": 3,
        "ne düşündüğünü merak ettim": 2,
        "sana güveniyorum": 3,
        "açık olmak istiyorum": 2,
        "hissettiklerimi söyleyeyim": 2,
        "teşekkür ederim": 1,
        "takdir ediyorum": 2,
        "seviyorum": 1,
        "özledim": 1,
        "mutlu oldum": 1,
        "anlıyorum": 1,
        "haklısın": 1,
        "birlikte": 1,
        "biz": 1,
    }

    STYLE_META = {
        "Kaygılı": {
            "en": "Anxious/Preoccupied",
            "description": (
                "Terk edilme korkusu ve onay arayışı ön plana çıkıyor. "
                "Partnerinizin tepkilerine karşı aşırı duyarlı olabilirsiniz. "
                "Güveni artırmak için açık iletişim ve net sınırlar faydalı olacaktır."
            ),
            "strengths": ["Derin bağlılık kapasitesi", "Empati", "Sadakat"],
            "growth_areas": [
                "Öz-güven geliştirme",
                "Belirsizliğe tolerans",
                "Kendi ihtiyaçlarını netleştirme",
            ],
        },
        "Kaçıngan": {
            "en": "Avoidant/Dismissing",
            "description": (
                "Duygusal mesafe ve bağımsızlık vurgusu belirgin. "
                "Yakınlık zaman zaman bunaltıcı hissettiriyor olabilir. "
                "Duyguları ifade etme pratiği ilişkiyi güçlendirebilir."
            ),
            "strengths": ["Özerklik", "Sakinlik", "Problem çözme odaklılık"],
            "growth_areas": [
                "Duygusal ifade",
                "Yakınlığa açılma",
                "Partnerin ihtiyaçlarını tanıma",
            ],
        },
        "Güvenli": {
            "en": "Secure",
            "description": (
                "Dengeli ve sağlıklı bağlanma örüntüleri görülüyor. "
                "Duyguları açıkça ifade edebiliyor, çatışmaları yapıcı şekilde yönetebiliyorsunuz. "
                "Bu güçlü temeli koruyun."
            ),
            "strengths": ["Açık iletişim", "Duygusal denge", "Güven"],
            "growth_areas": ["Sürekli büyüme ve öğrenme"],
        },
    }

    def analyze(self, conversation_text: str) -> dict[str, Any]:
        """
        Konuşma metninden bağlanma stilini tahmin et.

        Returns:
            {
              "style": "Kaygılı" | "Kaçıngan" | "Güvenli",
              "confidence": 0.0-1.0,
              "scores": {"Kaygılı": int, "Kaçıngan": int, "Güvenli": int},
              "evidence": [...],
              "description": str,
              "strengths": [...],
              "growth_areas": [...],
            }
        """
        text_lower = conversation_text.lower()

        scores = {"Kaygılı": 0, "Kaçıngan": 0, "Güvenli": 0}
        evidence: list[str] = []

        # Anxious scoring
        for phrase, weight in self.ANXIOUS_SIGNALS.items():
            count = text_lower.count(phrase)
            if count:
                scores["Kaygılı"] += count * weight
                if len(evidence) < 6:
                    evidence.append(f'"{phrase}" ({count}x)')

        # Avoidant scoring
        for phrase, weight in self.AVOIDANT_SIGNALS.items():
            count = text_lower.count(phrase)
            if count:
                scores["Kaçıngan"] += count * weight

        # Secure scoring
        for phrase, weight in self.SECURE_SIGNALS.items():
            count = text_lower.count(phrase)
            if count:
                scores["Güvenli"] += count * weight

        # Normalize scores to percentages
        total = sum(scores.values()) or 1
        pct = {k: round((v / total) * 100, 1) for k, v in scores.items()}

        # Determine dominant style
        dominant = max(scores, key=scores.get)

        # Confidence: how much dominant style leads
        sorted_scores = sorted(scores.values(), reverse=True)
        if sorted_scores[0] == 0:
            dominant = "Güvenli"  # Default if no signals found
            confidence = 0.4
        elif len(sorted_scores) > 1 and sorted_scores[1] > 0:
            confidence = round(
                min(sorted_scores[0] / (sorted_scores[0] + sorted_scores[1]), 0.95), 2
            )
        else:
            confidence = 0.85

        meta = self.STYLE_META[dominant]

        return {
            "style": dominant,
            "style_en": meta["en"],
            "confidence": confidence,
            "scores": pct,
            "evidence": evidence[:5],
            "description": meta["description"],
            "strengths": meta["strengths"],
            "growth_areas": meta["growth_areas"],
        }


# ---------------------------------------------------------------------------
# Love Language (Sevgi Dili) — Conversation Inference
# ---------------------------------------------------------------------------


class LoveLanguageInferrer:
    """
    Gary Chapman'ın 5 Sevgi Dili teorisine dayalı konuşma analizi.

    Kullanıcının test doldurmadan, konuşma tarzından sevgi dilini tahmin eder.
    """

    LANGUAGE_SIGNALS = {
        "Onaylayıcı Sözler": {
            "keywords": [
                "teşekkür",
                "harikasın",
                "güzelsin",
                "seni seviyorum",
                "takdir",
                "övgü",
                "ne kadar iyi",
                "mükemmel",
                "bravo",
                "aferin",
                "çok güzel",
                "süpersin",
                "inanılmaz",
                "muhteşem",
            ],
            "weight": 1.0,
        },
        "Kaliteli Zaman": {
            "keywords": [
                "birlikte",
                "seninle vakit",
                "buluşalım",
                "nereye gidelim",
                "film izleyelim",
                "yemek yiyelim",
                "gezmeye",
                "kahve içelim",
                "seninle olmak",
                "özledim",
                "görüşelim",
                "ne zaman geliyorsun",
            ],
            "weight": 1.0,
        },
        "Hediye Almak": {
            "keywords": [
                "hediye",
                "sürpriz",
                "aldım sana",
                "getirdim",
                "sipariş ettim",
                "doğum günü",
                "yıl dönümü",
                "özel gün",
                "paket",
                "çiçek",
            ],
            "weight": 1.2,  # Slightly higher — very explicit signal
        },
        "Hizmet Eylemleri": {
            "keywords": [
                "yardım ettim",
                "hallettim",
                "yaptım",
                "hazırladım",
                "pişirdim",
                "temizledim",
                "getirdim",
                "bıraktım",
                "ayarladım",
                "organize ettim",
                "senin için",
                "işini hallettim",
            ],
            "weight": 1.0,
        },
        "Fiziksel Temas": {
            "keywords": [
                "sarıl",
                "öp",
                "dokunuş",
                "el tut",
                "kucakla",
                "yanımda ol",
                "fiziksel",
                "yakın ol",
                "sarılmak istiyorum",
                "özledim seni",
                "gel yanıma",
            ],
            "weight": 1.0,
        },
    }

    def infer(self, conversation_text: str) -> dict[str, Any]:
        """
        Konuşmadan sevgi dilini tahmin et.

        Returns:
            {
              "primary": "Kaliteli Zaman",
              "secondary": "Onaylayıcı Sözler",
              "scores": {"Kaliteli Zaman": 45.0, ...},
              "confidence": 0.72,
              "evidence": [...],
              "note": str,
            }
        """
        text_lower = conversation_text.lower()
        scores: dict[str, float] = {lang: 0.0 for lang in self.LANGUAGE_SIGNALS}
        evidence: list[str] = []

        for lang, data in self.LANGUAGE_SIGNALS.items():
            for kw in data["keywords"]:
                count = text_lower.count(kw)
                if count:
                    scores[lang] += count * data["weight"]
                    if len(evidence) < 8 and lang not in [
                        e.split("→")[0].strip() for e in evidence
                    ]:
                        evidence.append(f'{lang} → "{kw}" ({count}x)')

        total = sum(scores.values()) or 1
        pct = {k: round((v / total) * 100, 1) for k, v in scores.items()}

        sorted_langs = sorted(pct.items(), key=lambda x: x[1], reverse=True)
        primary = sorted_langs[0][0]
        secondary = sorted_langs[1][0] if len(sorted_langs) > 1 else None

        # Confidence based on signal density
        top_score = sorted_langs[0][1]
        confidence = round(min(top_score / 100 * 1.5, 0.9), 2) if top_score > 0 else 0.3

        return {
            "primary": primary,
            "secondary": secondary,
            "scores": pct,
            "confidence": confidence,
            "evidence": evidence[:5],
            "note": (
                "Bu tahmin konuşma içeriğine dayanıyor. "
                "Kesin sonuç için Sevgi Dili testini tamamlayın."
            ),
        }


# ---------------------------------------------------------------------------
# Combined Psychology Service
# ---------------------------------------------------------------------------


class PsychologyService:
    """
    Bağlanma Stili + Sevgi Dili analizini birleştiren servis.
    Opsiyonel olarak LLM ile zenginleştirilmiş açıklamalar üretir.
    """

    def __init__(self):
        self.attachment_analyzer = AttachmentStyleAnalyzer()
        self.love_language_inferrer = LoveLanguageInferrer()

    def analyze(
        self,
        conversation_text: str,
        ai_service=None,
    ) -> dict[str, Any]:
        """
        Tam psikolojik profil analizi.

        Args:
            conversation_text: Analiz edilecek konuşma metni
            ai_service: Opsiyonel AIService — varsa LLM ile açıklama zenginleştirilir

        Returns:
            {
              "attachment_style": {...},
              "love_language": {...},
              "ai_enriched": bool,
              "summary": str,
            }
        """
        # 1. Kural tabanlı analiz (her zaman çalışır)
        attachment = self.attachment_analyzer.analyze(conversation_text)
        love_lang = self.love_language_inferrer.infer(conversation_text)

        result: dict[str, Any] = {
            "attachment_style": attachment,
            "love_language": love_lang,
            "ai_enriched": False,
            "summary": self._build_summary(attachment, love_lang),
        }

        # 2. LLM ile zenginleştirme (opsiyonel)
        if ai_service and ai_service._is_available():
            try:
                enriched = self._enrich_with_llm(
                    conversation_text, attachment, love_lang, ai_service
                )
                result["ai_insights"] = enriched
                result["ai_enriched"] = True
                logger.info(
                    "Psychology profile enriched with LLM",
                    extra={"provider": ai_service.provider},
                )
            except Exception as e:
                logger.warning(
                    "LLM enrichment failed, using rule-based only", extra={"error": str(e)}
                )

        return result

    def _build_summary(self, attachment: dict[str, Any], love_lang: dict[str, Any]) -> str:
        style = attachment["style"]
        lang = love_lang["primary"]
        conf_a = int(attachment["confidence"] * 100)
        conf_l = int(love_lang["confidence"] * 100)
        return (
            f"Bağlanma stili analizi: **{style}** (%{conf_a} güven). "
            f"Birincil sevgi dili: **{lang}** (%{conf_l} güven). "
            f"{attachment['description']}"
        )

    def _enrich_with_llm(
        self,
        conversation_text: str,
        attachment: dict[str, Any],
        love_lang: dict[str, Any],
        ai_service,
    ) -> dict[str, Any]:
        """LLM ile derinlemesine psikolojik içgörü üret"""
        prompt = f"""Sen bir ilişki psikoloğusun. Aşağıdaki kural tabanlı analizin sonuçlarını ve konuşma metnini kullanarak derinlemesine psikolojik içgörüler üret.

KURAL BAZLI ANALİZ SONUÇLARI:
- Bağlanma Stili: {attachment['style']} (güven: %{int(attachment['confidence']*100)})
- Sevgi Dili: {love_lang['primary']} (güven: %{int(love_lang['confidence']*100)})
- Kanıtlar: {', '.join(attachment.get('evidence', [])[:3])}

KONUŞMA ÖRNEĞİ (ilk 2000 karakter):
{conversation_text[:2000]}

GÖREV: Aşağıdaki JSON formatında yanıt ver:
{{
  "attachment_insight": "Bağlanma stili hakkında 2-3 cümle derinlemesine gözlem",
  "love_language_insight": "Sevgi dili hakkında 2-3 cümle gözlem ve öneri",
  "couple_dynamic": "İki tarafın dinamiği hakkında 2-3 cümle",
  "actionable_tip": "Bu hafta deneyebilecekleri somut bir öneri (1 cümle)"
}}

Sadece JSON döndür."""

        response = ai_service._call_llm(prompt=prompt, max_tokens=500, temperature=0.6)

        # JSON parse
        start = response.find("{")
        end = response.rfind("}") + 1
        if start != -1 and end > start:
            return json.loads(response[start:end])

        return {"raw": response}


import json  # noqa: E402 — needed for _enrich_with_llm

# ---------------------------------------------------------------------------
# Singleton
# ---------------------------------------------------------------------------

_psychology_service_instance = None


def get_psychology_service() -> PsychologyService:
    """PsychologyService singleton"""
    global _psychology_service_instance
    if _psychology_service_instance is None:
        _psychology_service_instance = PsychologyService()
    return _psychology_service_instance
