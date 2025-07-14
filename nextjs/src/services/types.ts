// API 응답 타입
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

// 채팅 세션 타입
export interface ChatSession {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface ChatSessionCreate {
  title: string;
}

// 메시지 타입
export interface Message {
  id: number;
  chat_session_id: number;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
}

export interface MessageCreate {
  chat_session_id: number;
  content: string;
  role: 'user' | 'assistant';
}

// 채팅 완성 요청
export interface ChatCompletionRequest {
  chat_id: number;
  message: string;
}

// 헬스체크 응답
export interface HealthResponse {
  status: string;
  timestamp: string;
  database: string;
  active_sessions: number;
}
