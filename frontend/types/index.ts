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
    messageCount?: number;
    timeRange?: string;
    analysisId?: number;
}

export interface Answer {
    questionId: number;
    answer: string;
}
