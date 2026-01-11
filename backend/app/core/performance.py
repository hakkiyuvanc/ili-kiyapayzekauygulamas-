"""
Performance optimization utilities for the analysis service.
"""

import logging
import time
from functools import lru_cache

logger = logging.getLogger(__name__)


class PerformanceMonitor:
    """Monitor and log performance metrics."""

    def __init__(self):
        self.metrics: dict[str, list] = {}

    def record(self, operation: str, duration: float):
        """Record operation duration."""
        if operation not in self.metrics:
            self.metrics[operation] = []
        self.metrics[operation].append(duration)

    def get_stats(self, operation: str) -> dict[str, float]:
        """Get statistics for an operation."""
        if operation not in self.metrics or not self.metrics[operation]:
            return {}

        durations = self.metrics[operation]
        return {
            "count": len(durations),
            "avg": sum(durations) / len(durations),
            "min": min(durations),
            "max": max(durations),
            "total": sum(durations),
        }

    def get_all_stats(self) -> dict[str, dict[str, float]]:
        """Get statistics for all operations."""
        return {op: self.get_stats(op) for op in self.metrics.keys()}


# Global performance monitor
perf_monitor = PerformanceMonitor()


def time_operation(operation_name: str):
    """Decorator to time and log operations."""

    def decorator(func):
        def wrapper(*args, **kwargs):
            start_time = time.time()
            try:
                result = func(*args, **kwargs)
                return result
            finally:
                duration = time.time() - start_time
                perf_monitor.record(operation_name, duration)
                if duration > 1.0:  # Log slow operations
                    logger.warning(f"Slow operation: {operation_name} took {duration:.2f}s")

        return wrapper

    return decorator


@lru_cache(maxsize=1000)
def cached_turkish_words():
    """Cache Turkish word lists for faster access."""
    positive_words = [
        "seviyorum",
        "aşkım",
        "canım",
        "güzel",
        "harika",
        "mükemmel",
        "mutlu",
        "şanslı",
        "keyifli",
        "hoş",
        "tatlı",
        "sevimli",
        "muhteşem",
        "enfes",
        "eğlenceli",
        "heyecanlı",
        "başarılı",
        "bebeğim",
        "hayatım",
        "özledim",
        "gülüm",
        "teşekkür",
    ]

    negative_words = [
        "kızgın",
        "sinirli",
        "üzgün",
        "mutsuz",
        "kötü",
        "berbat",
        "yorgun",
        "stresli",
        "endişeli",
        "kaygılı",
        "gergin",
        "sıkıcı",
        "can sıkıcı",
        "yanlış",
        "hata",
        "sorun",
        "problem",
        "kavga",
        "tartışma",
        "anlaşmazlık",
        "bıktım",
        "usandım",
    ]

    return {"positive": set(positive_words), "negative": set(negative_words)}


def batch_process_messages(messages: list, batch_size: int = 100):
    """Process messages in batches for better performance."""
    for i in range(0, len(messages), batch_size):
        yield messages[i : i + batch_size]
