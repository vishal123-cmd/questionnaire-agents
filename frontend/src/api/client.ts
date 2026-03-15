import axios from 'axios';
import type {
  User,
  AuthToken,
  LoginCredentials,
  RegisterData,
  Source,
  Conversation,
  Message,
  ChatQuery,
  Questionnaire,
  QuestionnaireResults,
} from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token (optional - authentication disabled)
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle errors without redirecting to login
    return Promise.reject(error);
  }
);

// ============= Auth API =============

export const authApi = {
  register: async (data: RegisterData): Promise<User> => {
    const response = await apiClient.post('/api/auth/register', data);
    return response.data;
  },

  login: async (credentials: LoginCredentials): Promise<AuthToken> => {
    const response = await apiClient.post('/api/auth/login/json', credentials);
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get('/api/auth/me');
    return response.data;
  },

  getWorkspaces: async () => {
    const response = await apiClient.get('/api/auth/workspaces');
    return response.data;
  },
};

// ============= Sources API =============

export const sourcesApi = {
  list: async (): Promise<Source[]> => {
    const response = await apiClient.get('/api/sources');
    return response.data;
  },

  uploadFile: async (file: File): Promise<Source> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post('/api/sources/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  addUrl: async (name: string, url: string): Promise<Source> => {
    const response = await apiClient.post('/api/sources/url', {
      name,
      type: 'url',
      url,
    });
    return response.data;
  },

  get: async (id: number): Promise<Source> => {
    const response = await apiClient.get(`/api/sources/${id}`);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/sources/${id}`);
  },

  getStatus: async (id: number) => {
    const response = await apiClient.get(`/api/sources/${id}/status`);
    return response.data;
  },
};

// ============= Chat API =============

export const chatApi = {
  query: async (query: ChatQuery): Promise<Response> => {
    // Return raw response for streaming
    const token = localStorage.getItem('auth_token');
    return fetch(`${API_BASE_URL}/api/chat/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(query),
    });
  },

  listConversations: async (): Promise<Conversation[]> => {
    const response = await apiClient.get('/api/chat/conversations');
    return response.data;
  },

  getMessages: async (conversationId: number): Promise<Message[]> => {
    const response = await apiClient.get(`/api/chat/conversations/${conversationId}/messages`);
    return response.data;
  },

  submitFeedback: async (messageId: number, feedback: 'up' | 'down'): Promise<void> => {
    await apiClient.post(`/api/chat/${messageId}/feedback`, { feedback });
  },
};

// ============= Questionnaire API =============

export const questionnaireApi = {
  upload: async (file: File): Promise<Questionnaire> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post('/api/questionnaire/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getStatus: async (id: number): Promise<Questionnaire> => {
    const response = await apiClient.get(`/api/questionnaire/${id}/status`);
    return response.data;
  },

  getResults: async (id: number): Promise<QuestionnaireResults> => {
    const response = await apiClient.get(`/api/questionnaire/${id}/results`);
    return response.data;
  },

  export: async (id: number): Promise<Blob> => {
    const response = await apiClient.get(`/api/questionnaire/${id}/export`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

export default apiClient;
