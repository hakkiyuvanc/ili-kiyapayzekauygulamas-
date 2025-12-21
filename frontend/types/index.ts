export type AnalysisType = 'message' | 'file' | 'relationship';

export interface InsightData {
    type: AnalysisType;
    score: number;
    metrics: {
        communication: number;
        emotional: number;
        compatibility: number;
        conflict: number;
        we_language?: { score: number; label: string }; // Optional to handle different API shapes
        sentiment?: { score: number; label: string };
        empathy?: { score: number; label: string };
    };
    findings: string[];
    recommendations: string[];
    riskAreas: string[];
    strengths: string[];
    timestamp: Date;
    timeRange?: string;
    analysisId?: number;
    messageCount?: number;
    replySuggestions?: string[];
}

export interface Answer {
    questionId: number;
    answer: string;
}

export interface User {
    id: number;
    email: string;
    full_name: string;
    username?: string;
    is_active: boolean;
    is_verified: boolean;
    is_pro: boolean;
    onboarding_completed?: boolean;
    goals?: string[];
    love_language?: string;
    conflict_resolution_style?: string;
}

export interface AnalysisResult extends InsightData {
    overall_score: number;
}

export interface Stats {
    total_analyses: number;
    weekly_score: number;
    streak: number;
}
