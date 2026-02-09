/**
 * TypeScript interfaces for AI service responses
 * These match the Pydantic models in backend/app/schemas/ai_responses.py
 */

export type InsightCategory = "Güçlü Yön" | "Gelişim Alanı" | "Dikkat Noktası";

export type RecommendationCategory =
    | "İletişim"
    | "Empati"
    | "Çatışma Yönetimi"
    | "Bağ Güçlendirme";

export type DifficultyLevel = "Düşük" | "Orta" | "Yüksek";

export type CommunicationTone = "Destekleyici" | "Nötr" | "Defansif" | "Saldırgan";

export type EmotionExpression = "Açık" | "Kapalı" | "Karışık";

export type Frequency = "Düşük" | "Orta" | "Yüksek";

export type Impact = "Pozitif" | "Nötr" | "Negatif";

export type RiskLevel = "Düşük" | "Orta" | "Yüksek" | "Kritik";

export type ComponentStatus =
    | "Kritik"
    | "Geliştirilmeli"
    | "Orta"
    | "İyi"
    | "Mükemmel";

export interface Insight {
    category: InsightCategory;
    title: string;
    description: string;
    icon?: string;
}

export interface Recommendation {
    category: RecommendationCategory;
    title: string;
    description: string;
    difficulty?: DifficultyLevel;
}

export interface GottmanComponent {
    skor: number; // 0-100
    durum: ComponentStatus;
    aciklama: string;
}

export interface GottmanMetrics {
    sevgi_haritalari: GottmanComponent;
    hayranlik_paylasimi: GottmanComponent;
    yakinlasma_cabalari: GottmanComponent;
    olumlu_perspektif: GottmanComponent;
    catisma_yonetimi: GottmanComponent;
    hayat_hayalleri: GottmanComponent;
    ortak_anlam: GottmanComponent;
}

export interface EmotionalAnalysis {
    iletisim_tonu: CommunicationTone;
    toksisite_seviyesi: number; // 0-100
    yakinlik: number; // 0-100
    duygu_ifadesi: EmotionExpression;
}

export interface DetectedPattern {
    kalip: string;
    ornekler: string[];
    frekans: Frequency;
    etki: Impact;
}

export interface ActionItem {
    baslik: string;
    ornek_cumle: string;
    oncelik: DifficultyLevel;
    kategori: string;
}

export interface GeneralReport {
    iliskki_sagligi: number; // 0-100
    baskin_dinamik: string;
    risk_seviyesi: RiskLevel;
}

export interface RelationshipReport {
    genel_karne: GeneralReport;
    gottman_bilesenleri: GottmanMetrics;
    duygusal_analiz: EmotionalAnalysis;
    tespit_edilen_kaliplar: DetectedPattern[];
    aksiyon_onerileri: ActionItem[];
    ozel_notlar?: string[];
}

export interface InsightsResponse {
    insights: Insight[];
}

export interface RecommendationsResponse {
    recommendations: Recommendation[];
}

/**
 * Helper function to get color based on score
 */
export function getScoreColor(score: number): string {
    if (score >= 80) return "#10b981"; // green
    if (score >= 60) return "#f59e0b"; // amber
    if (score >= 40) return "#f97316"; // orange
    return "#ef4444"; // red
}

/**
 * Helper function to get status color
 */
export function getStatusColor(status: ComponentStatus): string {
    switch (status) {
        case "Mükemmel":
            return "#10b981";
        case "İyi":
            return "#84cc16";
        case "Orta":
            return "#f59e0b";
        case "Geliştirilmeli":
            return "#f97316";
        case "Kritik":
            return "#ef4444";
        default:
            return "#6b7280";
    }
}

/**
 * Helper to convert Gottman metrics to chart data
 */
export function gottmanToChartData(metrics: GottmanMetrics) {
    return [
        { subject: "Sevgi Haritaları", score: metrics.sevgi_haritalari.skor, fullMark: 100 },
        { subject: "Hayranlık", score: metrics.hayranlik_paylasimi.skor, fullMark: 100 },
        { subject: "Yakınlaşma", score: metrics.yakinlasma_cabalari.skor, fullMark: 100 },
        { subject: "Olumlu Bakış", score: metrics.olumlu_perspektif.skor, fullMark: 100 },
        { subject: "Çatışma Yönetimi", score: metrics.catisma_yonetimi.skor, fullMark: 100 },
        { subject: "Hayaller", score: metrics.hayat_hayalleri.skor, fullMark: 100 },
        { subject: "Ortak Anlam", score: metrics.ortak_anlam.skor, fullMark: 100 },
    ];
}
