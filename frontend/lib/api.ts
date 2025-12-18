import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// Types
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
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  },

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
