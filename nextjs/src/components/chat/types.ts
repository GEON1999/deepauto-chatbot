// 기존 UI 컴포넌트용 타입 정의
export interface UIMessage {
  id: string;
  message: string;
  isUser: boolean;
  timestamp: Date;
}

export interface UISession {
  id: string; // session_id (UUID)
  title: string;
  timestamp: Date;
  messageCount: number;
  lastMessage?: string;
}

// API 연동 상태 관리
export interface ChatState {
  sessions: UISession[];
  sessionMessages: Record<string, UIMessage[]>;
  activeSessionId: string;
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
}

// 스트리밍 상태
export interface StreamingState {
  isStreaming: boolean;
  streamingMessageId: string | null;
  streamingContent: string;
}
