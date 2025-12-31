"""AI Service - LLM Entegrasyonu"""

import os
import json
import logging
import hashlib
import time
from typing import Dict, Any, Optional, List
from datetime import datetime
from openai import OpenAI
from anthropic import Anthropic

import google.generativeai as genai
from app.core.config import settings
from app.services.cache_service import cache_service
from app.services.knowledge_base import get_relevant_knowledge, format_knowledge_context

logger = logging.getLogger(__name__)

class AIService:
    """Yapay zeka servisi - OpenAI/Anthropic/Gemini entegrasyonu"""
    
    PROMPT_VERSION = "v2.1"  # Prompt versioning
    
    def __init__(self):
        self.openai_client = None
        self.anthropic_client = None
        self.gemini_client = None
        self.provider = settings.AI_PROVIDER
        
        # API anahtarlarını kontrol et
        if self.provider == "openai":
            api_key = settings.OPENAI_API_KEY
            if api_key:
                self.openai_client = OpenAI(api_key=api_key)
        elif self.provider == "anthropic":
            api_key = settings.ANTHROPIC_API_KEY
            if api_key:
                self.anthropic_client = Anthropic(api_key=api_key)
        elif self.provider == "gemini":
            api_key = settings.GEMINI_API_KEY
            if api_key:
                genai.configure(api_key=api_key)
                self.gemini_client = genai.GenerativeModel(settings.GEMINI_MODEL)
        
        # Structured logging
        if self._is_available():
            logger.info("AI Service initialized", extra={
                "provider": self.provider,
                "prompt_version": self.PROMPT_VERSION,
                "status": "available"
            })
        else:
            logger.warning("AI Service initialized without provider", extra={
                "provider": self.provider,
                "status": "fallback_mode"
            })

    def generate_insights(
        self,
        metrics: Dict[str, Any],
        conversation_summary: str,
        max_tokens: int = 1000
    ) -> List[Dict[str, str]]:
        """
        AI ile derinlemesine içgörüler oluştur (with caching & monitoring)
        
        Args:
            metrics: Hesaplanmış metrikler
            conversation_summary: Konuşma özeti
            max_tokens: Maksimum token sayısı
            
        Returns:
            İçgörü listesi
        """
        start_time = time.time()
        
        # Check cache first
        cache_key = self._get_cache_key("insights", metrics, conversation_summary)
        cached = cache_service.get(cache_key)
        
        if cached:
            logger.info("AI insights cache hit", extra={
                "cache_key": cache_key[:20],
                "latency_ms": (time.time() - start_time) * 1000
            })
            return cached
        
        if not self._is_available():
            fallback = self._fallback_insights(metrics)
            cache_service.set(cache_key, fallback, ttl_seconds=3600)
            return fallback
        
        try:
            # First attempt with enhanced prompt
            prompt = self._build_insights_prompt(metrics, conversation_summary)
            response = self._call_llm(prompt, max_tokens)
            insights = self._parse_insights_response(response)
            
            if insights:
                # Cache successful response
                cache_service.set(cache_key, insights, ttl_seconds=3600)  # 1 hour
                
                # Log success with metrics
                logger.info("AI insights generated successfully", extra={
                    "provider": self.provider,
                    "insights_count": len(insights),
                    "latency_ms": (time.time() - start_time) * 1000,
                    "cache_miss": True,
                    "prompt_version": self.PROMPT_VERSION
                })
                return insights
            
            # Retry with simplified prompt on parsing failure
            logger.warning("Retrying with simplified prompt", extra={"reason": "parsing_failure"})
            simple_prompt = self._build_simple_insights_prompt(metrics)
            response = self._call_llm(simple_prompt, max_tokens)
            insights = self._parse_insights_response(response)
            
            if insights:
                cache_service.set(cache_key, insights, ttl_seconds=1800)  # 30 min (lower quality)
            
            result = insights if insights else self._fallback_insights(metrics)
            cache_service.set(cache_key, result, ttl_seconds=3600)
            return result
            
        except Exception as e:
            logger.error("AI insights generation failed", extra={
                "error": str(e),
                "provider": self.provider,
                "latency_ms": (time.time() - start_time) * 1000
            }, exc_info=True)
            
            fallback = self._fallback_insights(metrics)
            cache_service.set(cache_key, fallback, ttl_seconds=3600)
            return fallback

    def generate_recommendations(
        self,
        metrics: Dict[str, Any],
        insights: List[Dict[str, str]],
        max_tokens: int = 800
    ) -> List[Dict[str, str]]:
        """
        AI ile kişiselleştirilmiş öneriler oluştur (with caching)
        """
        start_time = time.time()
        
        # Check cache
        cache_key = self._get_cache_key("recommendations", metrics, str(insights))
        cached = cache_service.get(cache_key)
        
        if cached:
            logger.info("AI recommendations cache hit", extra={
                "latency_ms": (time.time() - start_time) * 1000
            })
            return cached
        
        if not self._is_available():
            fallback = self._fallback_recommendations(metrics)
            cache_service.set(cache_key, fallback, ttl_seconds=3600)
            return fallback
        
        try:
            prompt = self._build_recommendations_prompt(metrics, insights)
            response = self._call_llm(prompt, max_tokens)
            recommendations = self._parse_recommendations_response(response)
            
            # Cache and log
            cache_service.set(cache_key, recommendations, ttl_seconds=3600)
            
            logger.info("AI recommendations generated", extra={
                "provider": self.provider,
                "recommendations_count": len(recommendations),
                "latency_ms": (time.time() - start_time) * 1000,
                "prompt_version": self.PROMPT_VERSION
            })
            
            return recommendations
            
        except Exception as e:
            logger.error("AI recommendations generation failed", extra={
                "error": str(e),
                "provider": self.provider,
                "latency_ms": (time.time() - start_time) * 1000
            }, exc_info=True)
            
            fallback = self._fallback_recommendations(metrics)
            cache_service.set(cache_key, fallback, ttl_seconds=3600)
            return fallback

    def chat_with_coach(
        self,
        message: str,
        history: List[Dict[str, str]],
        context: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        AI İlişki Koçu ile sohbet et
        """
        if not self._is_available():
            return "Üzgünüm, şu anda AI servislerine erişemiyorum. Lütfen daha sonra tekrar deneyin."

        system_prompt = """Sen profesyonel, empatik ve çözüm odaklı bir İlişki Koçusun. 
        Kullanıcıların ilişki sorunlarını dinler, yargılamadan analiz eder ve yapıcı tavsiyeler verirsin.
        Eğer bir analiz raporu bağlamı varsa, cevaplarını bu rapora dayandır.
        Kısa, net ve samimi cevaplar ver. Emoji kullanabilirsin."""

        if context:
            system_prompt += f"\n\nBAĞLAM (Analiz Raporu):\n{json.dumps(context, ensure_ascii=False)}"

        messages = [{"role": "system", "content": system_prompt}]
        
        # History format: [{'role': 'user', 'content': '...'}, ...]
        # Limit history to last 10 messages to save tokens
        for msg in history[-10:]:
            messages.append({"role": msg["role"], "content": msg["content"]})
            
        messages.append({"role": "user", "content": message})

        try:
            if self.provider == "openai" and self.openai_client:
                response = self.openai_client.chat.completions.create(
                    model="gpt-4o",  # or gpt-3.5-turbo
                    messages=messages,
                    max_tokens=500,
                    temperature=0.7
                )
                return response.choices[0].message.content
                
            elif self.provider == "gemini" and self.gemini_client:
                # Convert history to Gemini format
                gemini_history = []
                for msg in history[-10:]:
                    role = "user" if msg["role"] == "user" else "model"
                    gemini_history.append({"role": role, "parts": [msg["content"]]})
                
                # Add system prompt as the first message or configure it in model?
                # Gemini doesn't strictly have system message in chat history the same way.
                # We can prepend it to the first user message or use system_instruction if available in newer lib.
                # For compatibility, let's prepend system prompt context to the current message or start of history.
                
                # Simple approach: Prepend system prompt to the last message call for this turn
                full_message = f"{system_prompt}\n\nUSER MESSAGE: {message}"
                
                chat = self.gemini_client.start_chat(history=gemini_history)
                response = chat.send_message(full_message)
                return response.text
                
            # Default fallback
            return "AI sağlayıcı yapılandırması eksik."
            
        except Exception as e:
            logger.error("AI chat failed", extra={
                "error": str(e),
                "provider": self.provider,
                "message_length": len(message)
            }, exc_info=True)
            return "Üzgünüm, şu anda bir sorun yaşıyorum. Lütfen daha sonra tekrar deneyin."

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
        """İçgörü promptu oluştur (improved with few-shot & chain-of-thought & knowledge)"""
        
        # Context optimization: Extract top metrics only
        top_metrics = {
            "sentiment": metrics.get("sentiment", {}),
            "empathy": metrics.get("empathy", {}),
            "conflict": metrics.get("conflict", {}),
            "we_language": metrics.get("we_language", {})
        }
        
        # RAG Quick Win: Get relevant knowledge snippets
        knowledge = get_relevant_knowledge(metrics)
        knowledge_context = format_knowledge_context(knowledge)
        
        return f"""
{knowledge_context}
Sen bir ilişki psikoloğusun. Aşağıdaki görevi adım adım yap:

1. ADIM: Metrikleri incele
{json.dumps(top_metrics, indent=2, ensure_ascii=False)}

2. ADIM: Konuşma özetini oku
{summary}

3. ADIM: Yukarıdaki psikoloji bilgilerini referans alarak metriklere göre içgörüler üret

ÖRNEK ÇIKTILAR (Referans için):
[
  {{
    "category": "Güçlü Yön",
    "title": "Yüksek Empati Seviyesi",
    "description": "İletişimde karşınızı anlamaya yönelik güçlü çaba var. Bu, ilişkide güven ve yakınlık oluşturmanın temel taşıdır."
  }},
  {{
    "category": "Gelişim Alanı",
    "title": "Biz-dili Kullanımı Zayıf",
    "description": "Bireysel ifadeler ağırlıkta. 'Biz', 'birlikte' gibi kelimeler kullanarak ortaklık hissini güçlendirebilirsiniz."
  }},
  {{
    "category": "Dikkat Noktası",
    "title": "Çatışma Yönetimi",
    "description": "Anlaşmazlıklarda savunma moduna geçme eğilimi var. Açık ve sakin iletişim önemli."
  }}
]

4. ADIM: Yukarıdaki metriklere ve psikoloji bilgilerine göre 4-6 adet benzeri içgörü üret

FORMAT KURALLARI:
- category: sadece "Güçlü Yön", "Gelişim Alanı", veya "Dikkat Noktası"
- title: max 50 karakter, Türkçe
- description: 100-150 karakter, empatik ve destekleyici ton

Çıktını JSON array formatında ver (Markdown yok):
[
  {"category": "Güçlü Yön", "title": "...", "description": "..."},
  {"category": "Gelişim Alanı", "title": "...", "description": "..."}
]"""

    def _build_recommendations_prompt(self, metrics: Dict[str, Any], insights: List[Dict]) -> str:
        """Öneri promptu oluştur (improved with few-shot)"""
        
        # Context optimization: Top insights only
        top_insights = insights[:4] if len(insights) > 4 else insights
        
        return f"""
Sen bir ilişki koçusun. Aşağıdaki görevi adım adım yap:

1. ADIM: İçgörüleri oku
{json.dumps(top_insights, indent=2, ensure_ascii=False)}

2. ADIM: Metriklerdeki zayıf alanları tespit et
- Empati skoru: {metrics.get('empathy', {}).get('score', 'N/A')}
- Çatışma skoru: {metrics.get('conflict', {}).get('score', 'N/A')}
- Biz-dili skoru: {metrics.get('we_language', {}).get('score', 'N/A')}

3. ADIM: Somut, uygulanabilir öneriler oluştur

ÖRNEK ÇIKTILAR (Referans için):
[
  {{
    "category": "Bağ Güçlendirme",
    "title": "Ortak Hedefler Belirleyin",
    "description": "'Bizim için ne iyi?' sorusunu sorun. Haftalık bir 'biz' planı yapın ve birlikte karar alın."
  }},
  {{
    "category": "İletişim",
    "title": "Günlük Check-in Rutini",
    "description": "Her gün 10 dakika telefonlar kapalı konuşun. Sadece dinleyin ve 'Anlıyorum' deyin."
  }},
  {{
    "category": "Empati",
    "title": "Duygu Yansıtma Pratiği",
    "description": "Karşınızın söylediklerini kendi cümlelerinizle tekrarlayın. 'Senin için bu zor olmalı' gibi."
  }}
]

4. ADIM: Yukarıdaki içgörülere göre 4-5 adet benzeri öneri üret

FORMAT KURALLARI:
- category: "İletişim", "Empati", "Çatışma Yönetimi", veya "Bağ Güçlendirme"
- title: max 50 karakter, eyleme yönelik
- description: 100-150 karakter, somut adımlar içermeli

Çıktını JSON array formatında ver:
"""

    def _build_summary_prompt(self, basic_summary: str, metrics: Dict[str, Any]) -> str:
        """Özet geliştirme promptu"""
        return f"""
Aşağıdaki ilişki analizi özetini daha anlaşılır ve empatik hale getir:

MEVCUT ÖZET:
{basic_summary}

METRIKLER:
- Duygu Skoru: {metrics.get('sentiment', {}).get('score', 'N/A')}
- Empati Skoru: {metrics.get('empathy', {}).get('score', 'N/A')}
- Çatışma Skoru: {metrics.get('conflict', {}).get('score', 'N/A')}

Kısa (2-3 cümle), destekleyici ve yapıcı bir özet oluştur. Türkçe kullan.
"""

    def _build_simple_insights_prompt(self, metrics: Dict[str, Any]) -> str:
        """Simplified prompt for retry (error recovery)"""
        return f"""
İletişim analizi için içgörüler üret:

Metrikler:
- Duygu: {metrics.get('sentiment', {}).get('score', 'N/A')}
- Empati: {metrics.get('empathy', {}).get('score', 'N/A')}
- Çatışma: {metrics.get('conflict', {}).get('score', 'N/A')}

3-4 kısa içgörü JSON formatında ver:
[{{"category": "Güçlü Yön", "title": "...", "description": "..."}}]
"""

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
            
        elif self.provider == "gemini" and self.gemini_client:
            response = self.gemini_client.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    max_output_tokens=max_tokens,
                    temperature=0.7,
                )
            )
            return response.text.strip()
        
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

    
    def generate_reply_suggestions(
        self,
        metrics: Dict[str, Any],
        conversation_summary: str,
        max_tokens: int = 500
    ) -> List[str]:
        """
        AI ile cevap önerileri oluştur
        
        Args:
            metrics: Hesaplanmış metrikler
            conversation_summary: Konuşma özeti
            max_tokens: Maksimum token sayısı
            
        Returns:
            Cevap önerileri listesi
        """
        if not self._is_available():
            return self._fallback_reply_suggestions()

        prompt = self._build_reply_suggestions_prompt(metrics, conversation_summary)
        
        try:
            response = self._call_llm(prompt, max_tokens)
            suggestions = self._parse_reply_suggestions_response(response)
            return suggestions
        except Exception as e:
            logger.error("AI reply suggestions failed", extra={
                "error": str(e),
                "provider": self.provider
            }, exc_info=True)
            return self._fallback_reply_suggestions()

    def _fallback_reply_suggestions(self) -> List[str]:
        """AI kullanılamadığında varsayılan cevap önerileri"""
        return [
            "Anlıyorum, bu konuya farklı bir açıdan bakabiliriz.",
            "Duygularını paylaştığın için teşekkür ederim, seni daha iyi anlamak istiyorum.",
            "Bu durum beni de düşündürüyor, ortak bir çözüm bulalım."
        ]

    def _build_reply_suggestions_prompt(self, metrics: Dict[str, Any], summary: str) -> str:
        """Cevap önerileri için prompt oluştur"""
        return f"""
        Aşağıdaki ilişki analizine dayanarak, kullanıcının karşı tarafa yazabileceği 3 farklı cevap seçeneği öner.
        
        Analiz Özeti: {summary}
        Duygu Durumu: {metrics.get('sentiment', {}).get('score', 50)}/100
        Empati Seviyesi: {metrics.get('empathy', {}).get('score', 50)}/100
        
        Lütfen şu 3 farklı tonda cevap önerisi sun:
        1. Yapıcı ve Çözüm Odaklı
        2. Empatik ve Duygusal
        3. Net ve Sınır Koyucu
        
        Format: Sadece 3 madde halinde cevap metinlerini yaz. Başka açıklama ekleme.
        """

    def _parse_reply_suggestions_response(self, response: str) -> List[str]:
        """AI yanıtından cevap önerilerini ayıkla"""
        try:
            # Satır satır ayır ve temizle
            lines = [line.strip() for line in response.strip().split('\n') if line.strip()]
            suggestions = []
            for line in lines:
                # Numaralandırmayı temizle (1. , - vb.)
                cleaned = line.lstrip('1234567890.-*• ')
                if cleaned:
                    suggestions.append(cleaned)
            
            return suggestions[:3]  # En fazla 3 öneri
        except Exception:
            return self._fallback_reply_suggestions()

    
    def _get_cache_key(self, operation: str, metrics: Dict, context: str = "") -> str:
        """Generate cache key for AI responses"""
        data = {
            "operation": operation,
            "metrics": {k: v.get("score") if isinstance(v, dict) else v for k, v in metrics.items()},
            "context": context[:100] if context else "",  # First 100 chars only
            "version": self.PROMPT_VERSION
        }
        data_str = json.dumps(data, sort_keys=True)
        hash_key = hashlib.md5(data_str.encode()).hexdigest()
        return f"ai_{operation}:{hash_key}"
    
    def _is_available(self) -> bool:
        """AI servisi kullanılabilir mi?"""
        return (self.openai_client is not None) or (self.anthropic_client is not None) or (self.gemini_client is not None)

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
