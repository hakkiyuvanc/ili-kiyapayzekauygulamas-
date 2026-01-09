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

export type MessageRole = 'user' | 'assistant';

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
    sentiment: 'positive' | 'neutral' | 'negative';
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
        typeof error === 'object' &&
        error !== null &&
        'detail' in error &&
        typeof (error as ApiError).detail === 'string'
    );
}

export function isMessage(obj: unknown): obj is Message {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        'id' in obj &&
        'role' in obj &&
        'content' in obj &&
        ((obj as Message).role === 'user' || (obj as Message).role === 'assistant')
    );
}

export function isChatSession(obj: unknown): obj is ChatSession {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        'id' in obj &&
        'title' in obj &&
        'created_at' in obj &&
        'updated_at' in obj
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
