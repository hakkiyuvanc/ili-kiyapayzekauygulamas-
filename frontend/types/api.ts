/**
 * Shared Type Definitions for AMOR AI
 * Frontend-Backend API Contract Types
 */

// ============================================================================
// User & Authentication
// ============================================================================

export interface User {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
}

// ============================================================================
// Chat & Messages
// ============================================================================

export type MessageRole = "user" | "assistant";

export interface Message {
  id: number;
  role: MessageRole;
  content: string;
  created_at?: string;
}

export interface ChatSession {
  id: number;
  title: string;
  analysis_id?: number;
  created_at: string;
  updated_at: string;
  messages?: Message[];
}

export interface CreateSessionRequest {
  title: string;
  analysis_id?: number;
}

export interface SendMessageRequest {
  content: string;
}

// ============================================================================
// Analysis & Assessment
// ============================================================================

export interface RelationshipAnalysis {
  id: number;
  user_id: number;
  overall_score: number;
  communication_score?: number;
  emotional_bond_score?: number;
  conflict_resolution_score?: number;
  trust_score?: number;
  quality_time_score?: number;
  goal_alignment_score?: number;
  insights: string;
  recommendations: string[];
  created_at: string;
  updated_at: string;
}

export interface AssessmentAnswers {
  [category: string]: string;
}

export interface SubmitAssessmentRequest {
  answers: AssessmentAnswers;
}

// ============================================================================
// Message Analysis (Image/Text Analysis)
// ============================================================================

export interface MessageAnalysisResult {
  id: number;
  user_id: number;
  message_text: string;
  sentiment: "positive" | "neutral" | "negative";
  tone: string;
  communication_patterns: string[];
  suggestions: string[];
  created_at: string;
}

export interface AnalyzeMessageRequest {
  message_text: string;
  context?: string;
}

// ============================================================================
// API Response Wrappers
// ============================================================================

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  detail: string;
  status_code?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// ============================================================================
// System Status
// ============================================================================

export interface SystemStatus {
  ai_enabled: boolean;
  ai_provider: string;
  ai_available: boolean;
  database: string;
  version: string;
}

// ============================================================================
// Type Guards
// ============================================================================

export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "detail" in error &&
    typeof (error as ApiError).detail === "string"
  );
}

export function isMessage(obj: unknown): obj is Message {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "id" in obj &&
    "role" in obj &&
    "content" in obj &&
    ((obj as Message).role === "user" || (obj as Message).role === "assistant")
  );
}

export function isChatSession(obj: unknown): obj is ChatSession {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "id" in obj &&
    "title" in obj &&
    "created_at" in obj &&
    "updated_at" in obj
  );
}

// ============================================================================
// Utility Types
// ============================================================================

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type AsyncData<T> = {
  data: Optional<T>;
  isLoading: boolean;
  error: Optional<ApiError>;
};

// ============================================================================
// V2.0 API Types (Magic Features & Gottman)
// ============================================================================

// --- Gottman Analysis ---

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
}

export interface V2AnalysisResult {
  status: string;
  version: string;
  gottman_report: RelationshipReport;
  basic_metrics?: any;
  summary?: string;
  analysis_id?: number;
}

// --- Heatmap ---

export interface HeatmapData {
  hourly_tension: Array<{
    hour: number;
    tension: number;
    message_count: number;
  }>;
  topic_tension: Array<{
    topic: string;
    tension: number;
    risk_level: string;
    mention_count: number;
  }>;
  peak_moments: Array<{
    timestamp: string;
    sender: string;
    content_preview: string;
    tension_score: number;
  }>;
  overall_tension_score: number;
  tension_trend: string;
}

// --- Tone Shifter ---

export interface ToneShiftRequest {
  message: string;
  target_tone?: "yaratici" | "empatik" | "sakin" | "net";
  context?: string;
}

export interface ToneShiftResult {
  original_message: string;
  rewritten_message: string;
  target_tone: string;
  tone_name: string;
  analysis: {
    current_tone: string;
    tone_score: number;
    issues: Record<string, boolean>;
  };
  improvements: string[];
}

// --- Future Projection ---

export interface ProjectionScenario {
  tip: string;
  olasilik: number;
  aciklama: string;
  beklenen_metrikler: {
    iliskki_sagligi: number;
    mutluluk?: number;
    catisma?: number;
  };
  kritik_noktalar: string[];
  oneriler: string[];
}

export interface FutureProjection {
  current_state: any;
  timeframe_months: number;
  genel_tahmin: {
    risk_seviyesi: string;
    baskin_trend: string;
    onemli_uyarilar: string[];
  };
  senaryolar: ProjectionScenario[];
  aksiyon_plani: {
    ilk_30_gun: string[];
    "30_90_gun"?: string[];
    "90_180_gun"?: string[];
  };
}
