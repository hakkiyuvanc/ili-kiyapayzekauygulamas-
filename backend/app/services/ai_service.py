"""AI Service - LLM Entegrasyonu"""

import hashlib
import json
import logging
import os
import time
from datetime import datetime
from typing import Any, Optional

import google.generativeai as genai
from anthropic import Anthropic
from openai import OpenAI
from pydantic import ValidationError

from app.core.config import settings
from app.schemas.ai_responses import (
    Insight,
    InsightsResponse,
    Recommendation,
    RecommendationsResponse,
    RelationshipReport,
)
from app.services.cache_service import cache_service
from app.services.knowledge_base import format_knowledge_context, get_relevant_knowledge

logger = logging.getLogger(__name__)


class AIService:
    """Yapay zeka servisi - OpenAI/Anthropic/Gemini entegrasyonu"""

    PROMPT_VERSION = "v3.0"  # Prompt versioning - Strict JSON with Pydantic

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
                self.gemini_client = genai

        # Structured logging
        if self._is_available():
            logger.info(
                "AI Service initialized",
                extra={
                    "provider": self.provider,
                    "prompt_version": self.PROMPT_VERSION,
                    "status": "available",
                },
            )
        else:
            logger.warning(
                "AI Service initialized without provider",
                extra={"provider": self.provider, "status": "fallback_mode"},
            )

    def generate_insights(
        self, metrics: dict[str, Any], conversation_summary: str, max_tokens: int = 1200
    ) -> list[dict[str, str]]:
        """
        AI ile derinlemesine içgörüler oluştur (V3.0 - Strict JSON with Pydantic)

        Args:
            metrics: Hesaplanmış metrikler
            conversation_summary: Konuşma özeti
            max_tokens: Maksimum token sayısı

        Returns:
            İçgörü listesi (dict format for backward compatibility)
        """
        start_time = time.time()

        # Check cache first
        cache_key = self._get_cache_key("insights_v3", metrics, conversation_summary)
        cached = cache_service.get(cache_key)

        if cached:
            logger.info(
                "AI insights cache hit",
                extra={
                    "cache_key": cache_key[:20],
                    "latency_ms": (time.time() - start_time) * 1000,
                },
            )
            return cached

        if not self._is_available():
            fallback = self._fallback_insights(metrics)
            cache_service.set(cache_key, fallback, ttl_seconds=3600)
            return fallback

        try:
            # Build prompt for structured output
            prompt = self._build_insights_prompt_v3(metrics, conversation_summary)

            # Call with Pydantic validation
            validated_response = self._call_llm_structured(
                prompt=prompt, response_model=InsightsResponse, max_tokens=max_tokens
            )

            # Convert Pydantic models to dict for backward compatibility
            insights = [insight.model_dump() for insight in validated_response.insights]

            # Cache successful response
            cache_service.set(cache_key, insights, ttl_seconds=3600)

            # Log success
            logger.info(
                "AI insights generated successfully (V3.0)",
                extra={
                    "provider": self.provider,
                    "insights_count": len(insights),
                    "latency_ms": (time.time() - start_time) * 1000,
                    "prompt_version": self.PROMPT_VERSION,
                },
            )

            return insights

        except Exception as e:
            logger.error(
                "AI insights generation failed",
                extra={
                    "error": str(e),
                    "provider": self.provider,
                    "latency_ms": (time.time() - start_time) * 1000,
                },
                exc_info=True,
            )

            fallback = self._fallback_insights(metrics)
            cache_service.set(cache_key, fallback, ttl_seconds=3600)
            return fallback

    def generate_recommendations(
        self, metrics: dict[str, Any], insights: list[dict[str, str]], max_tokens: int = 800
    ) -> list[dict[str, str]]:
        """
        AI ile kişiselleştirilmiş öneriler oluştur (with caching)
        """
        start_time = time.time()

        # Check cache
        cache_key = self._get_cache_key("recommendations", metrics, str(insights))
        cached = cache_service.get(cache_key)

        if cached:
            logger.info(
                "AI recommendations cache hit",
                extra={"latency_ms": (time.time() - start_time) * 1000},
            )
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

            logger.info(
                "AI recommendations generated",
                extra={
                    "provider": self.provider,
                    "recommendations_count": len(recommendations),
                    "latency_ms": (time.time() - start_time) * 1000,
                    "prompt_version": self.PROMPT_VERSION,
                },
            )

            return recommendations

        except Exception as e:
            logger.error(
                "AI recommendations generation failed",
                extra={
                    "error": str(e),
                    "provider": self.provider,
                    "latency_ms": (time.time() - start_time) * 1000,
                },
                exc_info=True,
            )

            fallback = self._fallback_recommendations(metrics)
            cache_service.set(cache_key, fallback, ttl_seconds=3600)
            return fallback

    def chat_with_coach(
        self, message: str, history: list[dict[str, str]], context: Optional[dict[str, Any]] = None
    ) -> str:
        """
        AI İlişki Koçu ile sohbet et
        """
        if not self._is_available():
            return (
                "Üzgünüm, şu anda AI servislerine erişemiyorum. Lütfen daha sonra tekrar deneyin."
            )

        system_prompt = """Sen profesyonel, empatik ve çözüm odaklı bir İlişki Koçusun.
        Kullanıcıların ilişki sorunlarını dinler, yargılamadan analiz eder ve yapıcı tavsiyeler verirsin.
        Eğer bir analiz raporu bağlamı varsa, cevaplarını bu rapora dayandır.
        Kısa, net ve samimi cevaplar ver. Emoji kullanabilirsin."""

        if context:
            system_prompt += (
                f"\n\nBAĞLAM (Analiz Raporu):\n{json.dumps(context, ensure_ascii=False)}"
            )

        messages = [{"role": "system", "content": system_prompt}]

        # History format: [{'role': 'user', 'content': '...'}, ...]
        # Limit history to last 10 messages to save tokens
        for msg in history[-10:]:
            messages.append({"role": msg["role"], "content": msg["content"]})

        messages.append({"role": "user", "content": message})

        try:
            if self.provider == "openai" and self.openai_client:
                response = self.openai_client.chat.completions.create(
                    model=settings.OPENAI_MODEL,
                    messages=messages,
                    max_tokens=500,
                    temperature=0.7,
                )
                return response.choices[0].message.content

            elif self.provider == "gemini" and self.gemini_client:
                # Build chat history for Gemini
                chat_history = []

                # Add history (excluding system prompt)
                for msg in history[-10:]:
                    role = "user" if msg["role"] == "user" else "model"
                    chat_history.append({"role": role, "parts": [msg["content"]]})

                # Create chat session
                model = genai.GenerativeModel(
                    model_name=settings.GEMINI_MODEL, system_instruction=system_prompt
                )
                chat = model.start_chat(history=chat_history)

                # Send message
                response = chat.send_message(
                    message,
                    generation_config=genai.GenerationConfig(
                        max_output_tokens=500,
                        temperature=0.7,
                    ),
                )
                return response.text

            # Default fallback
            return "AI sağlayıcı yapılandırması eksik."

        except Exception as e:
            logger.error(
                "AI chat failed",
                extra={"error": str(e), "provider": self.provider, "message_length": len(message)},
                exc_info=True,
            )
            return "Üzgünüm, şu anda bir sorun yaşıyorum. Lütfen daha sonra tekrar deneyin."

    def enhance_summary(
        self, basic_summary: str, metrics: dict[str, Any], max_tokens: int = 500
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

    def _build_insights_prompt(self, metrics: dict[str, Any], summary: str) -> str:
        """İçgörü promptu oluştur (improved with few-shot & chain-of-thought & knowledge)"""

        # Context optimization: Extract top metrics only
        top_metrics = {
            "sentiment": metrics.get("sentiment", {}),
            "empathy": metrics.get("empathy", {}),
            "conflict": metrics.get("conflict", {}),
            "we_language": metrics.get("we_language", {}),
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

    def _build_recommendations_prompt(self, metrics: dict[str, Any], insights: list[dict]) -> str:
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

    def _build_summary_prompt(self, basic_summary: str, metrics: dict[str, Any]) -> str:
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

    def _build_simple_insights_prompt(self, metrics: dict[str, Any]) -> str:
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
                    {
                        "role": "system",
                        "content": "Sen Türkçe konuşan profesyonel bir ilişki terapistisin.",
                    },
                    {"role": "user", "content": prompt},
                ],
                max_tokens=max_tokens,
                temperature=0.7,
            )
            return response.choices[0].message.content.strip()

        elif self.provider == "anthropic" and self.anthropic_client:
            response = self.anthropic_client.messages.create(
                model=os.getenv("ANTHROPIC_MODEL", "claude-3-5-sonnet-20241022"),
                max_tokens=max_tokens,
                temperature=0.7,
                messages=[{"role": "user", "content": prompt}],
            )
            return response.content[0].text.strip()

        elif self.provider == "gemini" and self.gemini_client:
            model = genai.GenerativeModel(model_name=settings.GEMINI_MODEL)
            response = model.generate_content(
                prompt,
                generation_config=genai.GenerationConfig(
                    max_output_tokens=max_tokens,
                    temperature=0.7,
                ),
            )
            return response.text.strip()

        raise Exception("AI provider yapılandırılmamış")

    def _call_llm_structured(
        self, prompt: str, response_model: type, max_tokens: int, max_retries: int = 2
    ):
        """
        LLM çağrısı yap ve Pydantic modeli ile validate et (V3.0)

        Args:
            prompt: System + user prompt
            response_model: Pydantic model class (e.g., InsightsResponse)
            max_tokens: Max token count
            max_retries: Retry count on validation failure

        Returns:
            Validated Pydantic model instance

        Raises:
            ValidationError: If JSON doesn't match schema after retries
        """
        for attempt in range(max_retries + 1):
            try:
                # Get JSON schema from Pydantic model
                schema = response_model.model_json_schema()

                # Enhanced prompt with schema
                structured_prompt = f"""{prompt}

CRITICAL: Your response MUST be valid JSON matching this exact schema:
{json.dumps(schema, indent=2, ensure_ascii=False)}

Rules:
- Return ONLY the JSON object, no markdown, no explanations
- All required fields must be present
- Follow min/max constraints exactly
- Use Turkish language for text fields"""

                # Call LLM
                if self.provider == "openai" and self.openai_client:
                    # Try to use JSON mode if available
                    try:
                        response = self.openai_client.chat.completions.create(
                            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
                            messages=[
                                {
                                    "role": "system",
                                    "content": "Sen Türkçe konuşan profesyonel bir ilişki terapistisin. Sadece geçerli JSON döndür.",
                                },
                                {"role": "user", "content": structured_prompt},
                            ],
                            max_tokens=max_tokens,
                            temperature=0.7,
                            response_format={"type": "json_object"},  # JSON mode
                        )
                        raw_response = response.choices[0].message.content.strip()
                    except Exception:
                        # Fallback without JSON mode
                        response = self.openai_client.chat.completions.create(
                            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
                            messages=[
                                {
                                    "role": "system",
                                    "content": "Sen Türkçe konuşan profesyonel bir ilişki terapistisin.",
                                },
                                {"role": "user", "content": structured_prompt},
                            ],
                            max_tokens=max_tokens,
                            temperature=0.7,
                        )
                        raw_response = response.choices[0].message.content.strip()

                elif self.provider == "anthropic" and self.anthropic_client:
                    response = self.anthropic_client.messages.create(
                        model=os.getenv("ANTHROPIC_MODEL", "claude-3-5-sonnet-20241022"),
                        max_tokens=max_tokens,
                        temperature=0.7,
                        messages=[{"role": "user", "content": structured_prompt}],
                    )
                    raw_response = response.content[0].text.strip()

                elif self.provider == "gemini" and self.gemini_client:
                    model = genai.GenerativeModel(
                        model_name=settings.GEMINI_MODEL,
                        generation_config=genai.GenerationConfig(
                            response_mime_type="application/json",
                            max_output_tokens=max_tokens,
                            temperature=0.7,
                        ),
                    )
                    response = model.generate_content(structured_prompt)
                    raw_response = response.text.strip()
                else:
                    raise Exception("AI provider yapılandırılmamış")

                # Extract JSON if wrapped in markdown
                if "```json" in raw_response:
                    start = raw_response.find("```json") + 7
                    end = raw_response.rfind("```")
                    raw_response = raw_response[start:end].strip()
                elif "```" in raw_response:
                    start = raw_response.find("```") + 3
                    end = raw_response.rfind("```")
                    raw_response = raw_response[start:end].strip()

                # Parse and validate with Pydantic
                parsed_data = json.loads(raw_response)
                validated = response_model.model_validate(parsed_data)

                logger.info(
                    "Structured LLM call successful",
                    extra={
                        "model": response_model.__name__,
                        "attempt": attempt + 1,
                        "provider": self.provider,
                    },
                )

                return validated

            except (json.JSONDecodeError, ValidationError) as e:
                logger.warning(
                    f"Structured LLM validation failed (attempt {attempt + 1}/{max_retries + 1})",
                    extra={"error": str(e), "model": response_model.__name__},
                )

                if attempt == max_retries:
                    # Final attempt failed
                    logger.error(
                        "Structured LLM call failed after all retries",
                        extra={
                            "model": response_model.__name__,
                            "raw_response": raw_response[:200],
                        },
                    )
                    raise

                # Add error feedback to next attempt
                prompt = f"""{prompt}

PREVIOUS ATTEMPT FAILED with error: {str(e)}
Please fix the JSON structure and try again."""

        raise Exception("Structured LLM call failed")

    def _parse_insights_response(self, response: str) -> list[dict[str, str]]:
        """AI yanıtından içgörüleri parse et"""
        try:
            # JSON array'i bul ve parse et
            start = response.find("[")
            end = response.rfind("]") + 1
            if start != -1 and end > start:
                json_str = response[start:end]
                insights = json.loads(json_str)
                return insights[:6]  # Maksimum 6 içgörü
        except Exception as e:
            print(f"Parse hatası: {e}")

        return []

    def _parse_recommendations_response(self, response: str) -> list[dict[str, str]]:
        """AI yanıtından önerileri parse et"""
        try:
            start = response.find("[")
            end = response.rfind("]") + 1
            if start != -1 and end > start:
                json_str = response[start:end]
                recommendations = json.loads(json_str)
                return recommendations[:5]  # Maksimum 5 öneri
        except Exception as e:
            print(f"Parse hatası: {e}")

        return []

    def generate_reply_suggestions(
        self, metrics: dict[str, Any], conversation_summary: str, max_tokens: int = 500
    ) -> list[str]:
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
            logger.error(
                "AI reply suggestions failed",
                extra={"error": str(e), "provider": self.provider},
                exc_info=True,
            )
            return self._fallback_reply_suggestions()

    def _fallback_reply_suggestions(self) -> list[str]:
        """AI kullanılamadığında varsayılan cevap önerileri"""
        return [
            "Anlıyorum, bu konuya farklı bir açıdan bakabiliriz.",
            "Duygularını paylaştığın için teşekkür ederim, seni daha iyi anlamak istiyorum.",
            "Bu durum beni de düşündürüyor, ortak bir çözüm bulalım.",
        ]

    def _build_reply_suggestions_prompt(self, metrics: dict[str, Any], summary: str) -> str:
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

    def _parse_reply_suggestions_response(self, response: str) -> list[str]:
        """AI yanıtından cevap önerilerini ayıkla"""
        try:
            # Satır satır ayır ve temizle
            lines = [line.strip() for line in response.strip().split("\n") if line.strip()]
            suggestions = []
            for line in lines:
                # Numaralandırmayı temizle (1. , - vb.)
                cleaned = line.lstrip("1234567890.-*• ")
                if cleaned:
                    suggestions.append(cleaned)

            return suggestions[:3]  # En fazla 3 öneri
        except Exception:
            return self._fallback_reply_suggestions()

    def _get_cache_key(self, operation: str, metrics: dict, context: str = "") -> str:
        """Generate cache key for AI responses"""
        data = {
            "operation": operation,
            "metrics": {
                k: v.get("score") if isinstance(v, dict) else v for k, v in metrics.items()
            },
            "context": context[:100] if context else "",  # First 100 chars only
            "version": self.PROMPT_VERSION,
        }
        data_str = json.dumps(data, sort_keys=True)
        hash_key = hashlib.md5(data_str.encode()).hexdigest()
        return f"ai_{operation}:{hash_key}"

    def _is_available(self) -> bool:
        """AI servisi kullanılabilir mi?"""
        return (
            (self.openai_client is not None)
            or (self.anthropic_client is not None)
            or (self.gemini_client is not None)
        )

    def _fallback_insights(self, metrics: dict[str, Any]) -> list[dict[str, str]]:
        """AI yoksa fallback içgörüler"""
        insights = []

        # Duygu analizi
        sentiment_score = metrics.get("sentiment", {}).get("score", 0)
        if sentiment_score >= 60:
            insights.append(
                {
                    "category": "Güçlü Yön",
                    "title": "Olumlu İletişim",
                    "description": "İletişiminiz genel olarak pozitif ve destekleyici bir ton taşıyor.",
                    "icon": "✅",
                }
            )
        elif sentiment_score < 40:
            insights.append(
                {
                    "category": "Gelişim Alanı",
                    "title": "Duygusal Ton",
                    "description": "İletişimde daha olumlu bir dil kullanmaya özen gösterin.",
                    "icon": "💡",
                }
            )

        # Empati
        empathy_score = metrics.get("empathy", {}).get("score", 0)
        if empathy_score >= 60:
            insights.append(
                {
                    "category": "Güçlü Yön",
                    "title": "Yüksek Empati",
                    "description": "Karşınızdakinin duygularını anlamaya çalıştığınız açıkça görülüyor.",
                    "icon": "💝",
                }
            )
        else:
            insights.append(
                {
                    "category": "Gelişim Alanı",
                    "title": "Empati Geliştirme",
                    "description": "Daha fazla empatik ifade kullanarak iletişimi güçlendirebilirsiniz.",
                    "icon": "💡",
                }
            )

        # Çatışma
        conflict_score = metrics.get("conflict", {}).get("score", 0)
        if conflict_score > 50:
            insights.append(
                {
                    "category": "Dikkat Noktası",
                    "title": "Çatışma Belirtileri",
                    "description": "Konuşmada gerginlik işaretleri var. Sakin ve yapıcı iletişime odaklanın.",
                    "icon": "⚠️",
                }
            )

        return insights

    def _fallback_recommendations(self, metrics: dict[str, Any]) -> list[dict[str, str]]:
        """AI yoksa fallback öneriler"""
        recommendations = []

        # Biz-dili
        we_score = metrics.get("we_language", {}).get("score", 0)
        if we_score < 40:
            recommendations.append(
                {
                    "category": "Bağ Güçlendirme",
                    "title": "Biz-dili Kullanın",
                    "description": "'Biz', 'bizim' gibi kelimeler kullanarak ortak hedeflerinizi vurgulayın.",
                }
            )

        # Denge
        balance_score = metrics.get("communication_balance", {}).get("score", 0)
        if balance_score < 50:
            recommendations.append(
                {
                    "category": "İletişim",
                    "title": "İletişim Dengesi",
                    "description": "Her iki taraf da eşit şekilde kendini ifade etmeye çalışsın.",
                }
            )

        # Empati
        empathy_score = metrics.get("empathy", {}).get("score", 0)
        if empathy_score < 60:
            recommendations.append(
                {
                    "category": "Empati",
                    "title": "Aktif Dinleme",
                    "description": "Karşınızı dinlerken 'Anladım', 'Seni anlıyorum' gibi ifadeler kullanın.",
                }
            )

        return recommendations

    def generate_relationship_report(
        self,
        conversation_text: str,
        metrics: dict[str, Any],
        model_preference: str = "fast",
    ) -> dict[str, Any]:
        """
        Generate comprehensive relationship report with Gottman metrics (V2.0)

        Args:
            conversation_text: Full conversation text
            metrics: Basic metrics from analysis
            model_preference: 'fast' (GPT-4o-mini) or 'deep' (Claude-3.5-Sonnet)

        Returns:
            Structured relationship report (RelationshipReport schema)
        """
        start_time = time.time()

        # Cache key
        cache_key = self._get_cache_key("relationship_report_v2", metrics, conversation_text[:200])
        cached = cache_service.get(cache_key)

        if cached:
            logger.info(
                "Relationship report cache hit",
                extra={"latency_ms": (time.time() - start_time) * 1000},
            )
            return cached

        if not self._is_available():
            return self._fallback_relationship_report(metrics)

        try:
            # Build Gottman-based prompt
            prompt = self._build_gottman_report_prompt(conversation_text, metrics)

            # Select model based on preference
            if model_preference == "deep" and self.provider == "anthropic":
                # Use Claude for deep analysis
                max_tokens = 2500
            else:
                # Use faster model
                max_tokens = 2000

            # Call LLM
            response = self._call_llm(prompt, max_tokens)

            # Parse structured JSON
            report = self._parse_relationship_report(response, metrics)

            # Cache
            cache_service.set(cache_key, report, ttl_seconds=7200)  # 2 hours

            logger.info(
                "Relationship report generated",
                extra={
                    "provider": self.provider,
                    "model_preference": model_preference,
                    "latency_ms": (time.time() - start_time) * 1000,
                    "gottman_score": report.get("genel_karne", {}).get("iliskki_sagligi", 0),
                },
            )

            return report

        except Exception as e:
            logger.error(
                "Relationship report generation failed",
                extra={"error": str(e), "provider": self.provider},
                exc_info=True,
            )
            return self._fallback_relationship_report(metrics)

    def _build_gottman_report_prompt(self, conversation_text: str, metrics: dict[str, Any]) -> str:
        """Build Gottman-based analysis prompt (Enforcing JSON Schema)"""
        return f"""Sen bir İlişki Psikoloğusun ve John Gottman'ın 7 Prensibine göre ilişkileri analiz ediyorsun.

GÖREV: Aşağıdaki konuşma metnini ve temel metrikleri kullanarak, Gottman Metodu çerçevesinde derinlemesine bir ilişki analizi yap.

GİRDİLER:
1. KONUŞMA METNİ:
{conversation_text[:3000]}... (devamı var ama bağlam için bu kadarı yeterli)

2. TEMEL METRİKLER:
- Duygu Skoru: {metrics.get('sentiment', {}).get('score', 50)}
- Empati Skoru: {metrics.get('empathy', {}).get('score', 50)}
- Çatışma Skoru: {metrics.get('conflict', {}).get('score', 50)}

ÇIKTI FORMATI (KESİNLİKLE JSON OLMALI):
Aşağıdaki JSON şemasına BİREBİR uyan bir yanıt ver. Sadece JSON döndür, markdown veya açıklama ekleme.

{{
  "meta_data": {{
    "analiz_tarihi": "{datetime.now().isoformat()}",
    "model": "{self.provider}",
    "mesaj_sayisi": {len(conversation_text) // 50}, // Tahmini
    "platform": "generic"
  }},
  "genel_karne": {{
    "iliskki_sagligi": 0-100 arası bir puan,
    "baskin_dinamik": "Örn: Tutkulu ama Çatışmalı",
    "risk_seviyesi": "Düşük" | "Orta" | "Yüksek" | "Kritik"
  }},
  "gottman_bilesenleri": {{
    "sevgi_haritalari": {{ "skor": 0-100, "durum": "İyi", "aciklama": "Partnerini tanıma düzeyi..." }},
    "hayranlik_paylasimi": {{ "skor": 0-100, "durum": "Orta", "aciklama": "Takdir ve saygı..." }},
    "yakinlasma_cabalari": {{ "skor": 0-100, "durum": "Kritik", "aciklama": "İlgi gösterme..." }},
    "olumlu_perspektif": {{ "skor": 0-100, "durum": "İyi", "aciklama": "Genel bakış..." }},
    "catisma_yonetimi": {{ "skor": 0-100, "durum": "Geliştirilmeli", "aciklama": "Kavga yönetimi..." }},
    "hayat_hayalleri": {{ "skor": 0-100, "durum": "Orta", "aciklama": "Ortak hedefler..." }},
    "ortak_anlam": {{ "skor": 0-100, "durum": "İyi", "aciklama": "Ritüeller ve anlam..." }}
  }},
  "duygusal_analiz": {{
    "iletisim_tonu": "Örn: Savunmacı / Açık / Pasif-Agresif",
    "toksisite_seviyesi": 0-100,
    "yakinlik": 0-100,
    "duygu_ifadesi": "Örn: Duygular bastırılıyor / Açıkça ifade ediliyor",
    "empati_puani": 0-100
  }},
  "tespit_edilen_kaliplar": [
    {{
      "kalip": "Örn: Mahşerin 4 Atlısı - Aşağılama",
      "ornekler": ["Mesajdan alıntı 1", "Mesajdan alıntı 2"],
      "frekans": "Düşük" | "Orta" | "Yüksek",
      "etki": "Pozitif" | "Nötr" | "Negatif"
    }}
  ],
  "aksiyon_onerileri": [
    {{
      "baslik": "Örn: Mola Verin",
      "ornek_cumle": "Şu an çok gerginim, 20 dakika sonra konuşalım mı?",
      "oncelik": "Yüksek" | "Orta" | "Düşük",
      "kategori": "Çatışma Yönetimi"
    }}
  ],
  "ozel_notlar": ["Gözlem 1", "Gözlem 2"]
}}
"""

    def _parse_relationship_report(self, response: str, metrics: dict[str, Any]) -> dict[str, Any]:
        """Parse relationship report using Pydantic validation"""
        from app.schemas.analysis import RelationshipReport

        try:
            # Clean response (remove markdown if present)
            cleaned_response = response.strip()
            if cleaned_response.startswith("```json"):
                cleaned_response = cleaned_response[7:]
            if cleaned_response.endswith("```"):
                cleaned_response = cleaned_response[:-3]

            cleaned_response = cleaned_response.strip()

            # Parse JSON
            # First try direct parsing
            report_data = json.loads(cleaned_response)

            # Validate with Pydantic
            validated_report = RelationshipReport(**report_data)

            return validated_report.dict()

        except json.JSONDecodeError as e:
            logger.error(f"JSON Decode Error in Relationship Report: {e}")
            logger.debug(f"Raw Response: {response[:500]}...")
            return self._fallback_relationship_report(metrics)
        except Exception as e:
            logger.error(f"Validation Error in Relationship Report: {e}")
            return self._fallback_relationship_report(metrics)

    def _parse_relationship_report(self, response: str, metrics: dict[str, Any]) -> dict[str, Any]:
        """Parse AI response into structured report"""
        try:
            # Extract JSON
            start = response.find("{")
            end = response.rfind("}") + 1
            if start != -1 and end > start:
                json_str = response[start:end]
                report_data = json.loads(json_str)

                # Add metadata
                report_data["meta_data"] = {
                    "analiz_tarihi": time.strftime("%Y-%m-%dT%H:%M:%S"),
                    "model": self.provider,
                    "mesaj_sayisi": metrics.get("total_messages", 0),
                    "platform": metrics.get("platform", "unknown"),
                }

                return report_data

        except Exception as e:
            logger.error(f"Report parsing failed: {e}")

        return self._fallback_relationship_report(metrics)

    def _fallback_relationship_report(self, metrics: dict[str, Any]) -> dict[str, Any]:
        """Fallback report when AI is unavailable"""
        sentiment_score = metrics.get("sentiment", {}).get("score", 50)
        empathy_score = metrics.get("empathy", {}).get("score", 50)
        conflict_score = metrics.get("conflict", {}).get("score", 50)

        # Calculate overall health
        overall_health = int((sentiment_score + empathy_score + (100 - conflict_score)) / 3)

        return {
            "meta_data": {
                "analiz_tarihi": time.strftime("%Y-%m-%dT%H:%M:%S"),
                "model": "fallback",
                "mesaj_sayisi": metrics.get("total_messages", 0),
                "platform": "unknown",
            },
            "genel_karne": {
                "iliskki_sagligi": overall_health,
                "baskin_dinamik": "Standart Analiz (AI Kullanılamıyor)",
                "risk_seviyesi": "Orta" if overall_health < 50 else "Düşük",
            },
            "gottman_bilesenleri": {
                "sevgi_haritalari": {"skor": 50, "durum": "Orta", "aciklama": "AI analizi gerekli"},
                "hayranlik_paylasimi": {
                    "skor": empathy_score,
                    "durum": "Orta",
                    "aciklama": "Empati skoruna dayalı",
                },
                "yakinlasma_cabalari": {
                    "skor": 50,
                    "durum": "Orta",
                    "aciklama": "AI analizi gerekli",
                },
                "olumlu_perspektif": {
                    "skor": sentiment_score,
                    "durum": "Orta",
                    "aciklama": "Duygu skoruna dayalı",
                },
                "catisma_yonetimi": {
                    "skor": 100 - conflict_score,
                    "durum": "Orta",
                    "aciklama": "Çatışma skoruna dayalı",
                },
                "hayat_hayalleri": {"skor": 50, "durum": "Orta", "aciklama": "AI analizi gerekli"},
                "ortak_anlam": {"skor": 50, "durum": "Orta", "aciklama": "AI analizi gerekli"},
            },
            "duygusal_analiz": {
                "iletisim_tonu": "Nötr",
                "toksisite_seviyesi": conflict_score,
                "yakinlik": empathy_score,
                "duygu_ifadesi": "Karışık",
            },
            "tespit_edilen_kaliplar": [
                {
                    "kalip": "Standart İletişim",
                    "ornekler": ["AI analizi için API key gerekli"],
                    "frekans": "Orta",
                    "etki": "Nötr",
                }
            ],
            "aksiyon_onerileri": [
                {
                    "baslik": "AI Analizi Aktifleştirin",
                    "ornek_cumle": "Daha detaylı analiz için AI API key'i ekleyin",
                    "oncelik": "Yüksek",
                    "kategori": "Sistem",
                }
            ],
            "ozel_notlar": ["AI servisi kullanılamıyor, temel metrikler gösteriliyor"],
        }


# Singleton instance
_ai_service_instance = None


def get_ai_service() -> AIService:
    """AI service singleton"""
    global _ai_service_instance
    if _ai_service_instance is None:
        _ai_service_instance = AIService()
    return _ai_service_instance
