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

// Re-export specific V2 types if needed, or define them here if they are not in `api.ts` (which they were, but let's centralize)

// V2.0 Types (Mirroring backend/app/schemas/analysis.py)
export interface GottmanComponent {
    skor: number;
    durum: string;
    aciklama: string;
}

export interface RelationshipReport {
    meta_data: {
        analiz_tarihi: string;
        model: string;
        mesaj_sayisi: number;
    };
    genel_karne: {
        iliskki_sagligi: number;
        baskin_dinamik: string;
        risk_seviyesi: string;
    };
    gottman_bilesenleri: {
        sevgi_haritalari: GottmanComponent;
        hayranlik_paylasimi: GottmanComponent;
        yakinlasma_cabalari: GottmanComponent;
        olumlu_perspektif: GottmanComponent;
        catisma_yonetimi: GottmanComponent;
        hayat_hayalleri: GottmanComponent;
        ortak_anlam: GottmanComponent;
    };
    duygusal_analiz: {
        iletisim_tonu: string;
        toksisite_seviyesi: number;
        yakinlik: number;
        duygu_ifadesi: string;
        empati_puani: number;
    };
    tespit_edilen_kaliplar: Array<{
        kalip: string;
        ornekler: string[];
        frekans: string;
        etki: string;
    }>;
    aksiyon_onerileri: Array<{
        baslik: string;
        ornek_cumle: string;
        oncelik: string;
        kategori: string;
    }>;
    ozel_notlar: string[];
}

export interface V2AnalysisResult {
    status: string;
    version: string;
    gottman_report: RelationshipReport;
    basic_metrics?: any;
    summary?: string;
    analysis_id?: number;
    heatmap?: HeatmapData;
}

export interface HeatmapData {
    hourly_tension: { hour: number; tension: number; message_count: number }[];
    topic_tension: {
        topic: string;
        tension: number;
        risk_level: string;
        mention_count: number;
    }[];
    overall_tension_score: number;
    peak_moments?: any[];
    tension_trend?: string;
}

// Re-define RelationshipAnalysis to include V1 and potential V2 extensions
export interface RelationshipAnalysis {
    overall_score: number;
    metrics: {
        sentiment: { score: number; label: string };
        empathy: { score: number; label: string };
        conflict: { score: number; label: string };
        we_language: { score: number; label: string };
        communication_balance: { score: number; label: string };
    };
    summary: string;
    insights: Array<{
        category: string;
        title: string;
        description: string;
        icon: string;
    }>;
    recommendations: Array<{
        priority: string;
        title: string;
        description: string;
        exercise: string;
    }>;
    analysis_id?: number;
}
