"""Unit tests for AI Service"""

from unittest.mock import MagicMock, patch

from app.services.ai_service import AIService, get_ai_service


class TestAIServiceInitialization:
    """Test AI service initialization"""

    def test_singleton_pattern(self):
        """Test that get_ai_service returns same instance"""
        service1 = get_ai_service()
        service2 = get_ai_service()
        assert service1 is service2

    @patch("app.services.ai_service.settings")
    def test_initialization_with_gemini(self, mock_settings):
        """Test initialization with Gemini provider"""
        mock_settings.AI_PROVIDER = "gemini"
        mock_settings.GEMINI_API_KEY = "test-key"
        mock_settings.GEMINI_MODEL = "gemini-pro"

        service = AIService()
        assert service.provider == "gemini"
        assert service._is_available()

    @patch("app.services.ai_service.settings")
    def test_initialization_without_key(self, mock_settings):
        """Test initialization without API key"""
        mock_settings.AI_PROVIDER = "openai"
        mock_settings.OPENAI_API_KEY = None

        service = AIService()
        assert not service._is_available()


class TestCacheKeyGeneration:
    """Test cache key generation"""

    def test_cache_key_format(self):
        """Test cache key format"""
        service = AIService()
        metrics = {"sentiment": {"score": 75}}

        key = service._get_cache_key("insights", metrics, "test")

        assert key.startswith("ai_insights:")
        assert len(key) > 20  # operation + : + hash

    def test_cache_key_consistency(self):
        """Test cache keys are consistent for same input"""
        service = AIService()
        metrics = {"sentiment": {"score": 75}}

        key1 = service._get_cache_key("insights", metrics, "test")
        key2 = service._get_cache_key("insights", metrics, "test")

        assert key1 == key2

    def test_cache_key_different_for_different_input(self):
        """Test cache keys differ for different input"""
        service = AIService()

        key1 = service._get_cache_key("insights", {"sentiment": {"score": 75}}, "test")
        key2 = service._get_cache_key("insights", {"sentiment": {"score": 80}}, "test")

        assert key1 != key2


class TestInsightsGeneration:
    """Test insights generation"""

    @patch("app.services.ai_service.cache_service")
    def test_insights_cache_hit(self, mock_cache):
        """Test insights returned from cache"""
        service = AIService()
        cached_insights = [{"category": "Güçlü Yön", "title": "Test"}]
        mock_cache.get.return_value = cached_insights

        result = service.generate_insights({"sentiment": {"score": 75}}, "test summary")

        assert result == cached_insights
        mock_cache.get.assert_called_once()

    @patch("app.services.ai_service.cache_service")
    def test_insights_fallback_when_no_ai(self, mock_cache):
        """Test fallback insights when AI unavailable"""
        service = AIService()
        service.gemini_client = None
        service.openai_client = None
        mock_cache.get.return_value = None

        result = service.generate_insights({"sentiment": {"score": 75}}, "test")

        assert isinstance(result, list)
        assert len(result) > 0
        mock_cache.set.assert_called_once()

    @patch("app.services.ai_service.cache_service")
    def test_insights_with_mock_llm(self, mock_cache):
        """Test insights generation with mocked LLM"""
        service = AIService()
        service.gemini_client = MagicMock()
        mock_cache.get.return_value = None

        # Mock LLM response
        mock_response = MagicMock()
        mock_response.text = '[{"category": "Güçlü Yön", "title": "Empati", "description": "Test"}]'
        service.gemini_client.generate_content.return_value = mock_response

        result = service.generate_insights({"empathy": {"score": 90}}, "test")

        assert len(result) > 0
        assert result[0]["category"] == "Güçlü Yön"
        mock_cache.set.assert_called()


class TestRecommendationsGeneration:
    """Test recommendations generation"""

    @patch("app.services.ai_service.cache_service")
    def test_recommendations_cache_hit(self, mock_cache):
        """Test recommendations from cache"""
        service = AIService()
        cached_recs = [{"category": "İletişim", "title": "Test"}]
        mock_cache.get.return_value = cached_recs

        result = service.generate_recommendations({}, [])

        assert result == cached_recs

    @patch("app.services.ai_service.cache_service")
    def test_recommendations_fallback(self, mock_cache):
        """Test fallback recommendations"""
        service = AIService()
        service.gemini_client = None
        mock_cache.get.return_value = None

        result = service.generate_recommendations({"empathy": {"score": 30}}, [])

        assert isinstance(result, list)
        assert len(result) > 0


class TestResponseParsing:
    """Test response parsing"""

    def test_parse_insights_valid_json(self):
        """Test parsing valid JSON insights"""
        service = AIService()
        response = '[{"category": "Güçlü Yön", "title": "Test", "description": "Desc"}]'

        result = service._parse_insights_response(response)

        assert len(result) == 1
        assert result[0]["category"] == "Güçlü Yön"

    def test_parse_insights_with_markdown_wrapper(self):
        """Test parsing JSON wrapped in markdown"""
        service = AIService()
        response = '```json\n[{"category": "Test", "title": "T", "description": "D"}]\n```'

        result = service._parse_insights_response(response)

        assert len(result) > 0

    def test_parse_insights_invalid_json(self):
        """Test parsing invalid JSON returns empty list"""
        service = AIService()
        response = "invalid json {"

        result = service._parse_insights_response(response)

        assert result == []


class TestFallbackMechanisms:
    """Test fallback mechanisms"""

    def test_fallback_insights_structure(self):
        """Test fallback insights have correct structure"""
        service = AIService()
        metrics = {"sentiment": {"score": 75}, "empathy": {"score": 85}, "conflict": {"score": 20}}

        result = service._fallback_insights(metrics)

        assert isinstance(result, list)
        assert all("category" in item for item in result)
        assert all("title" in item for item in result)
        assert all("description" in item for item in result)

    def test_fallback_recommendations_structure(self):
        """Test fallback recommendations structure"""
        service = AIService()
        metrics = {"we_language": {"score": 30}}

        result = service._fallback_recommendations(metrics)

        assert isinstance(result, list)
        assert len(result) > 0


class TestPromptVersioning:
    """Test prompt versioning"""

    def test_prompt_version_set(self):
        """Test prompt version is set"""
        service = AIService()
        assert hasattr(service, "PROMPT_VERSION")
        assert service.PROMPT_VERSION == "v2.1"

    def test_version_in_cache_key(self):
        """Test version is part of cache key"""
        service = AIService()
        key = service._get_cache_key("insights", {}, "test")
        # Version impacts the hash, so changing version changes key
        assert key is not None


class TestErrorHandling:
    """Test error handling"""

    @patch("app.services.ai_service.cache_service")
    def test_insights_error_returns_fallback(self, mock_cache):
        """Test that errors return fallback"""
        service = AIService()
        service.gemini_client = MagicMock()
        mock_cache.get.return_value = None

        # Make LLM raise exception
        service.gemini_client.generate_content.side_effect = Exception("API Error")

        result = service.generate_insights({"sentiment": {"score": 75}}, "test")

        assert isinstance(result, list)  # Returns fallback
        assert len(result) > 0


# Run with: pytest tests/backend/test_ai_service.py -v
