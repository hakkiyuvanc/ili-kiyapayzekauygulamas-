"""Feature gating constants for Pro vs Free tier"""

# Free tier limitations
FREE_TIER_DAILY_ANALYSIS_LIMIT = 1
FREE_TIER_MAX_RECOMMENDATIONS = 2
FREE_TIER_CHAT_MESSAGES_LIMIT = 10  # Per day

# Pro-only features (will be filtered out for free users)
PRO_ONLY_FEATURES = [
    "reply_suggestions",      # AI-generated reply suggestions
    "detailed_insights",      # Extended analysis insights  
    "advanced_metrics",       # Additional metric calculations
    "trend_analysis",         # Historical trend tracking
    "pdf_export",            # PDF report generation
    "priority_support",      # Priority customer support
]

# Rate limiting
FREE_TIER_RATE_LIMIT = "5/minute"
PRO_TIER_RATE_LIMIT = "20/minute"
