"""AI Service - LLM Entegrasyonu"""

import os
import json
from typing import Dict, Any, Optional, List
from openai import OpenAI
from anthropic import Anthropic


class AIService:
    """Yapay zeka servisi - OpenAI/Anthropic entegrasyonu"""

    def __init__(self):
        self.openai_client = None
        self.anthropic_client = None
        self.provider = os.getenv("AI_PROVIDER", "openai")  # openai, anthropic
        
        # API anahtarlarını kontrol et
        if self.provider == "openai":
            api_key = os.getenv("OPENAI_API_KEY")
            if api_key:
                self.openai_client = OpenAI(api_key=api_key)
        elif self.provider == "anthropic":
            api_key = os.getenv("ANTHROPIC_API_KEY")
            if api_key:
                self.anthropic_client = Anthropic(api_key=api_key)

    def generate_insights(
        self,
        metrics: Dict[str, Any],
        conversation_summary: str,
        max_tokens: int = 1000
    ) -> List[Dict[str, str]]:
        """
        AI ile derinlemesine içgörüler oluştur
        
        Args:
            metrics: Hesaplanmış metrikler
            conversation_summary: Konuşma özeti
            max_tokens: Maksimum token sayısı
            
        Returns:
            İçgörü listesi
        """
        if not self._is_available():
            return self._fallback_insights(metrics)

        prompt = self._build_insights_prompt(metrics, conversation_summary)
        
        try:
            response = self._call_llm(prompt, max_tokens)
            insights = self._parse_insights_response(response)
            return insights
        except Exception as e:
            print(f"AI hatası: {e}")
            return self._fallback_insights(metrics)

    def generate_recommendations(
        self,
        metrics: Dict[str, Any],
        insights: List[Dict[str, str]],
        max_tokens: int = 800
    ) -> List[Dict[str, str]]:
        """
        AI ile kişiselleştirilmiş öneriler oluştur
        
        Args:
            metrics: Hesaplanmış metrikler
            insights: Oluşturulan içgörüler
            max_tokens: Maksimum token sayısı
            
        Returns:
            Öneri listesi
        """
        if not self._is_available():
            return self._fallback_recommendations(metrics)

        prompt = self._build_recommendations_prompt(metrics, insights)
        
        try:
            response = self._call_llm(prompt, max_tokens)
            recommendations = self._parse_recommendations_response(response)
            return recommendations
        except Exception as e:
            print(f"AI hatası: {e}")
            return self._fallback_recommendations(metrics)

    def enhance_summary(
        self,
        basic_summary: str,
        metrics: Dict[str, Any],
        max_tokens: int = 500
    ) -> str:
        """
        AI ile özeti geliştir
        
        Args:
            basic_summary: Temel özet
            metrics: Metrikler
            max_tokens: Maksimum token sayısı
            
        Returns:
            Geliştirilmiş özet
        """
        if not self._is_available():
            return basic_summary

        prompt = self._build_summary_prompt(basic_summary, metrics)
        
        try:
            return self._call_llm(prompt, max_tokens)
        except Exception:
            return basic_summary

    def _build_insights_prompt(self, metrics: Dict[str, Any], summary: str) -> str:
        """İçgörü promptu oluştur"""
        return f"""Sen bir ilişki psikoloğusun. Aşağıdaki konuşma analiz metriklerine göre derinlemesine içgörüler üret.

METRIKLER:
{json.dumps(metrics, ensure_ascii=False, indent=2)}

KONUŞMA ÖZETI:
{summary}

Lütfen 4-6 adet içgörü üret. Her içgörü şu formatta olmalı:
- category: "Güçlü Yön", "Gelişim Alanı", veya "Dikkat Noktası"
- title: Kısa başlık (max 50 karakter)
- description: Detaylı açıklama (100-150 karakter)

Çıktını JSON array formatında ver:
[
  {{"category": "Güçlü Yön", "title": "...", "description": "..."}},
  {{"category": "Gelişim Alanı", "title": "...", "description": "..."}}
]"""

    def _build_recommendations_prompt(self, metrics: Dict[str, Any], insights: List[Dict]) -> str:
        """Öneri promptu oluştur"""
        insights_text = json.dumps(insights, ensure_ascii=False, indent=2)
        
        return f"""Sen bir ilişki koçusun. Aşağıdaki metriklere ve içgörülere göre uygulanabilir öneriler üret.

METRIKLER:
{json.dumps(metrics, ensure_ascii=False, indent=2)}

İÇGÖRÜLER:
{insights_text}

Lütfen 4-5 adet somut, uygulanabilir öneri üret. Her öneri şu formatta olmalı:
- category: "İletişim", "Empati", "Çatışma Yönetimi", veya "Bağ Güçlendirme"
- title: Kısa başlık (max 50 karakter)
- description: Detaylı, uygulanabilir öneri (100-150 karakter)

Çıktını JSON array formatında ver:
[
  {{"category": "İletişim", "title": "...", "description": "..."}},
  {{"category": "Empati", "title": "...", "description": "..."}}
]"""

    def _build_summary_prompt(self, basic_summary: str, metrics: Dict[str, Any]) -> str:
        """Özet geliştirme promptu"""
        return f"""Aşağıdaki ilişki analizi özetini daha anlaşılır ve empatik hale getir:

MEVCUT ÖZET:
{basic_summary}

METRIKLER:
- Duygu Skoru: {metrics.get('sentiment', {}).get('score', 0)}
- Empati Skoru: {metrics.get('empathy', {}).get('score', 0)}
- Çatışma Skoru: {metrics.get('conflict', {}).get('score', 0)}

Kısa (2-3 cümle), destekleyici ve yapıcı bir özet oluştur. Türkçe yaz."""

    def _call_llm(self, prompt: str, max_tokens: int) -> str:
        """LLM çağrısı yap"""
        if self.provider == "openai" and self.openai_client:
            response = self.openai_client.chat.completions.create(
                model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
                messages=[
                    {"role": "system", "content": "Sen Türkçe konuşan profesyonel bir ilişki terapistisin."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=max_tokens,
                temperature=0.7
            )
            return response.choices[0].message.content.strip()
        
        elif self.provider == "anthropic" and self.anthropic_client:
            response = self.anthropic_client.messages.create(
                model=os.getenv("ANTHROPIC_MODEL", "claude-3-5-sonnet-20241022"),
                max_tokens=max_tokens,
                temperature=0.7,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            return response.content[0].text.strip()
        
        raise Exception("AI provider yapılandırılmamış")

    def _parse_insights_response(self, response: str) -> List[Dict[str, str]]:
        """AI yanıtından içgörüleri parse et"""
        try:
            # JSON array'i bul ve parse et
            start = response.find('[')
            end = response.rfind(']') + 1
            if start != -1 and end > start:
                json_str = response[start:end]
                insights = json.loads(json_str)
                return insights[:6]  # Maksimum 6 içgörü
        except Exception as e:
            print(f"Parse hatası: {e}")
        
        return []

    def _parse_recommendations_response(self, response: str) -> List[Dict[str, str]]:
        """AI yanıtından önerileri parse et"""
        try:
            start = response.find('[')
            end = response.rfind(']') + 1
            if start != -1 and end > start:
                json_str = response[start:end]
                recommendations = json.loads(json_str)
                return recommendations[:5]  # Maksimum 5 öneri
        except Exception as e:
            print(f"Parse hatası: {e}")
        
        return []

    def _is_available(self) -> bool:
        """AI servisi kullanılabilir mi?"""
        return (self.openai_client is not None) or (self.anthropic_client is not None)

    def _fallback_insights(self, metrics: Dict[str, Any]) -> List[Dict[str, str]]:
        """AI yoksa fallback içgörüler"""
        insights = []
        
        # Duygu analizi
        sentiment_score = metrics.get("sentiment", {}).get("score", 0)
        if sentiment_score >= 60:
            insights.append({
                "category": "Güçlü Yön",
                "title": "Olumlu İletişim",
                "description": "İletişiminiz genel olarak pozitif ve destekleyici bir ton taşıyor.",
                "icon": "✅"
            })
        elif sentiment_score < 40:
            insights.append({
                "category": "Gelişim Alanı",
                "title": "Duygusal Ton",
                "description": "İletişimde daha olumlu bir dil kullanmaya özen gösterin.",
                "icon": "💡"
            })
        
        # Empati
        empathy_score = metrics.get("empathy", {}).get("score", 0)
        if empathy_score >= 60:
            insights.append({
                "category": "Güçlü Yön",
                "title": "Yüksek Empati",
                "description": "Karşınızdakinin duygularını anlamaya çalıştığınız açıkça görülüyor.",
                "icon": "💝"
            })
        else:
            insights.append({
                "category": "Gelişim Alanı",
                "title": "Empati Geliştirme",
                "description": "Daha fazla empatik ifade kullanarak iletişimi güçlendirebilirsiniz.",
                "icon": "💡"
            })
        
        # Çatışma
        conflict_score = metrics.get("conflict", {}).get("score", 0)
        if conflict_score > 50:
            insights.append({
                "category": "Dikkat Noktası",
                "title": "Çatışma Belirtileri",
                "description": "Konuşmada gerginlik işaretleri var. Sakin ve yapıcı iletişime odaklanın.",
                "icon": "⚠️"
            })
        
        return insights

    def _fallback_recommendations(self, metrics: Dict[str, Any]) -> List[Dict[str, str]]:
        """AI yoksa fallback öneriler"""
        recommendations = []
        
        # Biz-dili
        we_score = metrics.get("we_language", {}).get("score", 0)
        if we_score < 40:
            recommendations.append({
                "category": "Bağ Güçlendirme",
                "title": "Biz-dili Kullanın",
                "description": "'Biz', 'bizim' gibi kelimeler kullanarak ortak hedeflerinizi vurgulayın."
            })
        
        # Denge
        balance_score = metrics.get("communication_balance", {}).get("score", 0)
        if balance_score < 50:
            recommendations.append({
                "category": "İletişim",
                "title": "İletişim Dengesi",
                "description": "Her iki taraf da eşit şekilde kendini ifade etmeye çalışsın."
            })
        
        # Empati
        empathy_score = metrics.get("empathy", {}).get("score", 0)
        if empathy_score < 60:
            recommendations.append({
                "category": "Empati",
                "title": "Aktif Dinleme",
                "description": "Karşınızı dinlerken 'Anladım', 'Seni anlıyorum' gibi ifadeler kullanın."
            })
        
        return recommendations


# Singleton instance
_ai_service_instance = None


def get_ai_service() -> AIService:
    """AI service singleton"""
    global _ai_service_instance
    if _ai_service_instance is None:
        _ai_service_instance = AIService()
    return _ai_service_instance
