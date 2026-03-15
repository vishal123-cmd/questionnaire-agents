// ============= Type Definitions =============

export interface User {
  id: number;
  email: string;
  full_name: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Workspace {
  id: number;
  name: string;
  description: string | null;
  owner_id: number;
  created_at: string;
}

export interface Source {
  id: number;
  workspace_id: number;
  name: string;
  type: 'file' | 'url' | 'gdrive' | 'confluence' | 'notion';
  status: 'pending' | 'indexing' | 'indexed' | 'error';
  file_path: string | null;
  url: string | null;
  file_size: number | null;
  file_type: string | null;
  chunk_count: number;
  last_synced_at: string | null;
  created_at: string;
  error_message?: string | null;
}

export interface Conversation {
  id: number;
  title: string;
  created_at: string;
  message_count: number;
}

export interface Message {
  id: number;
  conversation_id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  sources_json: ChatSource[] | null;
  feedback: 'up' | 'down' | null;
  created_at: string;
}

export interface ChatSource {
  source_id: number;
  source_name: string;
  chunk_text: string;
  page: number | null;
  score: number;
}

export interface ChatQuery {
  conversation_id?: number;
  query: string;
  source_ids?: number[];
}

export interface ChatResponse {
  conversation_id: number;
  message_id: number;
  answer: string;
  sources: ChatSource[];
  confidence: number;
}

export interface Questionnaire {
  id: number;
  filename: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  question_count: number;
  answered_count: number;
  created_at: string;
}

export interface QuestionnaireAnswer {
  question: string;
  answer: string;
  source_name: string | null;
  confidence: number;
}

export interface QuestionnaireResults {
  id: number;
  filename: string;
  status: string;
  results: QuestionnaireAnswer[];
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name?: string;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
}
