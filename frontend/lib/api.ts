import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { env } from "./env";

const API_BASE_URL = env.NEXT_PUBLIC_API_URL;

// Analysis endpoints take longer — give them 2 minutes
const ANALYSIS_TIMEOUT_MS = 120_000;
const DEFAULT_TIMEOUT_MS = 30_000;

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: DEFAULT_TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor — auth token + per-endpoint timeout
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && token !== "guest-token") {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Give analysis/upload endpoints more time
  const url = config.url ?? "";
  if (url.includes("/analysis/") || url.includes("/upload")) {
    config.timeout = ANALYSIS_TIMEOUT_MS;
  }
  return config;
});

// ─── Auto-retry helper (exponential backoff) ─────────────────────────────────
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 2_000; // doubles each attempt

function shouldRetry(error: AxiosError): boolean {
  const status = error.response?.status;
  // Retry on network errors and transient server issues
  return (
    !error.response || // network error / timeout
    status === 429 ||  // rate limit
    status === 503 ||  // service unavailable
    status === 502     // bad gateway
  );
}

async function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── Response interceptor — logging + auto-retry + auth redirect ──────────────
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as AxiosRequestConfig & { _retryCount?: number };
    const isGuest =
      typeof window !== "undefined" && localStorage.getItem("isGuest") === "true";

    // Log
    if (error.response) {
      if (!(isGuest && error.response.status === 401)) {
        console.error(
          `[API Error] Status: ${error.response.status} URL: ${config?.url}`,
          error.response.data,
        );
      }
    } else if (error.request) {
      console.error(`[API Network Error] URL: ${config?.url}`, {
        baseURL: config?.baseURL,
        url: config?.url,
        method: config?.method,
        message: error.message,
      });
    } else {
      console.error("[API Error]", error.message);
    }

    // Auto-retry for transient failures
    config._retryCount = config._retryCount ?? 0;
    if (config._retryCount < MAX_RETRIES && shouldRetry(error)) {
      config._retryCount += 1;

      // Respect Retry-After header for 429s
      const retryAfter = error.response?.headers?.["retry-after"];
      const delay = retryAfter
        ? parseInt(retryAfter, 10) * 1000
        : RETRY_DELAY_MS * Math.pow(2, config._retryCount - 1);

      console.info(`[API] Retry ${config._retryCount}/${MAX_RETRIES} in ${delay}ms…`);
      await sleep(delay);
      return api(config);
    }

    // 401 redirect (non-login, non-guest)
    const isLoginRequest = config?.url?.includes("/auth/login");
    if (error.response?.status === 401 && !isLoginRequest && !isGuest) {
      console.warn("[API] 401 Unauthorized detected. Redirecting to login.");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/auth";
    } else if (error.response?.status === 401 && isGuest) {
      console.log("[API] 401 for guest user - expected, ignoring.");
    }

    return Promise.reject(error);
  },
);

// Types
import {
  InsightData,
  User,
  V2AnalysisResult,
  RelationshipAnalysis as V1RelationshipAnalysis,
} from "@/types";

export type { User };

export interface AnalysisRequest {
  text: string;
  format_type?: string;
  privacy_mode?: boolean;
}

export interface AnalysisResponse {
  overall_score: number;
  metrics: {
    sentiment: MetricData;
    empathy: MetricData;
    conflict: MetricData;
    we_language: MetricData;
    communication_balance: MetricData;
  };
  summary: string;
  insights: Insight[];
  recommendations: Recommendation[];
  reply_suggestions?: string[];
  analysis_id?: number;
  id?: number; // From history endpoint
  created_at?: string; // From history endpoint
  full_report?: any; // Nested report from history endpoint
  conversation_stats?: {
    total_messages: number;
    participant_count: number;
    participants: string[];
    message_distribution: Record<
      string,
      {
        count: number;
        percentage: number;
        avg_length: number;
        total_words: number;
      }
    >;
    avg_message_length: number;
    total_words: number;
  };
}

// Re-export types for component usage
export type RelationshipAnalysis = AnalysisResponse;
export type { V2AnalysisResult };

export interface MetricData {
  score: number;
  label: string;
  [key: string]: any;
}

export interface Insight {
  category: string;
  title: string;
  description: string;
  icon: string;
}

export interface Recommendation {
  priority: string;
  title: string;
  description: string;
  exercise: string;
}

// API functions
export const analysisApi = {
  analyze: (data: AnalysisRequest) =>
    api.post<AnalysisResponse>("/api/analysis/analyze", data),

  uploadAndAnalyze: (file: File, privacyMode = true) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post<AnalysisResponse>(
      `/api/upload/upload-and-analyze?privacy_mode=${privacyMode}&save_to_db=true`,
      formData,
    );
  },

  uploadAndAnalyzeV2: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post<V2AnalysisResult>(
      "/api/upload/upload-and-analyze-v2?save_to_db=true",
      formData,
    );
  },

  rewriteMessage: (text: string, target_tone: string) =>
    api.post<{ original_text: string; rewritten_text: string; tone: string }>(
      "/api/analysis/rewrite",
      { text, target_tone },
    ),

  getUserStats: () =>
    api.get<{ total_analyses: number; weekly_score: number; streak: number }>(
      "/api/stats/user-stats",
    ),

  getHistory: (skip = 0, limit = 10) =>
    api.get("/api/analysis/history", { params: { skip, limit } }),

  getAnalysis: (id: number) =>
    api.get<AnalysisResponse>(`/api/analysis/history/${id}`),

  deleteAnalysis: (id: number) => api.delete(`/api/analysis/history/${id}`),

  // V2.0 Endpoints
  analyzeScreenshot: (image: string, format = "png") =>
    api.post("/api/analysis/analyze-screenshot", { image, format }),

  analyzeV2: (text: string, model_preference = "fast", format_type = "auto") =>
    api.post("/api/analysis/analyze-v2", {
      text,
      model_preference,
      format_type,
    }),

  generateHeatmap: (messages: any[]) =>
    api.post("/api/analysis/heatmap", { messages }),

  shiftTone: (message: string, target_tone: string, context = "") =>
    api.post("/api/analysis/tone-shift", {
      message,
      target_tone,
      context,
    }),

  projectFuture: (metrics: any, timeframe_months = 6, gottman_report?: any) =>
    api.post("/api/analysis/future-projection", {
      metrics,
      timeframe_months,
      gottman_report,
    }),

  responseAssistant: (received_message: string, context = "") =>
    api.post<{
      status: string;
      received_message: string;
      ai_generated: boolean;
      responses: Array<{
        tone: string;
        label: string;
        emoji: string;
        description: string;
        response: string;
        color: string;
      }>;
    }>("/api/analysis/response-assistant", { received_message, context }),

  exportPdf: (analysisId: number) =>
    api.get(`/api/analysis/history/${analysisId}/pdf`, {
      responseType: "blob",
    }),

  exportHtml: (analysisId: number) =>
    api.get(`/api/analysis/history/${analysisId}/html`, {
      responseType: "blob",
    }),
};

export const authApi = {
  register: (data: { email: string; password: string; full_name: string }) =>
    api.post("/api/auth/register", data),

  login: (data: { username: string; password: string }) => {
    const params = new URLSearchParams();
    params.append("username", data.username);
    params.append("password", data.password);
    return api.post("/api/auth/login", params, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
  },

  getProfile: () => api.get("/api/auth/me"),

  verify: (data: { email: string; code: string }) =>
    api.post("/api/auth/verify", data),
};

export const systemApi = {
  getStatus: () =>
    api.get<{ ai_available: boolean; ai_provider: string }>(
      "/api/system/status",
    ),
};

export const subscriptionApi = {
  createCheckoutSession: () =>
    api.post<{ url: string }>("/api/subscription/create-checkout-session"),
  createPortalSession: () =>
    api.post<{ url: string }>("/api/subscription/portal"),
};

export const userApi = {
  updateOnboarding: (data: {
    full_name?: string;
    goals?: string[];
    love_language?: string;
    conflict_resolution_style?: string;
    onboarding_completed?: boolean;
  }) => api.patch<User>("/api/users/me/onboarding", data),

  updateGoals: (goals: string[]) =>
    api.patch<User>("/api/users/me/onboarding", { goals }),

  updateProfile: (data: Partial<User>) =>
    api.patch<User>("/api/users/me/onboarding", data),
};

export const coachingApi = {
  getStatus: () =>
    api.get<{ current_focus_area: string; completed_tasks: string[] }>(
      "/api/coaching/status",
    ),
  updateStatus: (data: {
    current_focus_area?: string;
    completed_tasks?: string[];
  }) =>
    api.patch<{ current_focus_area: string; completed_tasks: string[] }>(
      "/api/coaching/status",
      data,
    ),
};

export const chatApi = {
  createSession: (data: { title?: string; analysis_id?: number }) =>
    api.post("/api/chat/sessions", data),

  getSessions: (skip = 0, limit = 20) =>
    api.get("/api/chat/sessions", { params: { skip, limit } }),

  getSession: (id: number) => api.get(`/api/chat/sessions/${id}`),

  sendMessage: (sessionId: number, content: string) =>
    api.post(`/api/chat/sessions/${sessionId}/messages`, {
      role: "user",
      content,
    }),
};
