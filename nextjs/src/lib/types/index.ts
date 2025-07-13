// 기본 UI 컴포넌트 타입 정의
export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export interface InputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  type?: 'text' | 'email' | 'password' | 'number';
  disabled?: boolean;
  error?: string;
  required?: boolean;
  className?: string;
}

export interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

// 채팅 관련 타입 (메모리에서 언급된 세션 관리 고려)
export interface ChatMessage {
  id: string;
  content: string;
  timestamp: Date;
  isUser: boolean;
}

export interface ChatSession {
  session_id: string; // UUID 기반 세션 관리
  messages: ChatMessage[];
  created_at: Date;
  updated_at: Date;
}

// 레이아웃 관련 타입
export interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}
