import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  console.log(`[API Request] ${config.url} - Token present: ${!!token}`);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(`[API Error] Status: ${error.response?.status} URL: ${error.config?.url}`, error.response?.data);

    // Don't redirect if it's a login attempt that failed (401 is expected for wrong password)
    const isLoginRequest = error.config?.url?.includes('/auth/login');

    if (error.response?.status === 401 && !isLoginRequest) {
      console.warn('[API] 401 Unauthorized detected. Redirecting to login.');
      // Clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// Types
import { AnalysisResult, InsightData, Stats, User } from '@/types';

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
    message_distribution: Record<string, {
      count: number;
      percentage: number;
      avg_length: number;
      total_words: number;
    }>;
    avg_message_length: number;
    total_words: number;
  };
}

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
    api.post<AnalysisResponse>('/api/analysis/analyze', data),

  uploadAndAnalyze: (file: File, privacyMode = true) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<AnalysisResponse>(
      `/api/upload/upload-and-analyze?privacy_mode=${privacyMode}&save_to_db=true`,
      formData
    );
  },

  rewriteMessage: (text: string, target_tone: string) =>
    api.post<{ original_text: string; rewritten_text: string; tone: string }>('/api/analysis/rewrite', { text, target_tone }),

  getUserStats: () =>
    api.get<{ total_analyses: number; weekly_score: number; streak: number }>('/api/stats/user-stats'),


  getHistory: (skip = 0, limit = 10) =>
    api.get('/api/analysis/history', { params: { skip, limit } }),

  getAnalysis: (id: number) =>
    api.get<AnalysisResponse>(`/api/analysis/history/${id}`),

  deleteAnalysis: (id: number) =>
    api.delete(`/api/analysis/history/${id}`),
};

export const authApi = {
  register: (data: { email: string; password: string; full_name: string }) =>
    api.post('/api/auth/register', data),

  login: (data: { username: string; password: string }) => {
    const params = new URLSearchParams();
    params.append('username', data.username);
    params.append('password', data.password);
    return api.post('/api/auth/login', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  },

  getProfile: () =>
    api.get('/api/auth/me'),

  verify: (data: { email: string; code: string }) =>
    api.post('/api/auth/verify', data),
};

export const systemApi = {
  getStatus: () => api.get<{ ai_available: boolean; ai_provider: string }>('/api/system/status'),
};

export const subscriptionApi = {
  createCheckoutSession: () => api.post<{ url: string }>('/api/subscription/create-checkout-session'),
  createPortalSession: () => api.post<{ url: string }>('/api/subscription/portal'),
};

export const userApi = {
  updateOnboarding: (data: { full_name?: string; goals: string[]; onboarding_completed: boolean }) =>
    api.patch<User>('/api/users/me/onboarding', data),

  updateGoals: (goals: string[]) =>
    api.patch<User>('/api/users/me/onboarding', { goals, onboarding_completed: true }),
};

export const chatApi = {
  createSession: (data: { title?: string; analysis_id?: number }) =>
    api.post('/api/chat/sessions', data),

  getSessions: (skip = 0, limit = 20) =>
    api.get('/api/chat/sessions', { params: { skip, limit } }),

  getSession: (id: number) =>
    api.get(`/api/chat/sessions/${id}`),

  sendMessage: (sessionId: number, content: string) =>
    api.post(`/api/chat/sessions/${sessionId}/messages`, { role: 'user', content }),
};
