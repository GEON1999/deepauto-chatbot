import {
  ChatSession,
  ChatSessionCreate,
  Message,
  ChatCompletionRequest,
  HealthResponse,
  ApiResponse
} from './types';

// API 기본 설정
const API_BASE_URL = 'http://localhost:8000/api/v1';

// 기본 fetch 헬퍼 함수
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  // DELETE 메서드나 빈 응답을 반환하는 API 호출 처리
  if (options.method === 'DELETE') {
    // DELETE 요청의 경우 빈 객체 반환 (대부분의 DELETE API는 응답 바디가 없음)
    return {} as unknown as T;
  }

  const contentType = response.headers.get('content-type');
  
  // 콘텐츠 타입이 JSON이 아니거나 널인 경우
  if (!contentType || !contentType.includes('application/json')) {
    return {} as unknown as T;
  }
  
  try {
    return await response.json();
  } catch (error) {
    console.warn('Failed to parse JSON response:', error);
    return {} as unknown as T;
  }
}

// 채팅 세션 API
export const sessionApi = {
  // 세션 목록 조회
  getSessions: async (skip = 0, limit = 20): Promise<ChatSession[]> => {
    return fetchApi(`/chats?skip=${skip}&limit=${limit}`);
  },

  // 세션 조회
  getSession: async (chatId: number): Promise<ChatSession> => {
    return fetchApi(`/chats/${chatId}`);
  },

  // 세션 생성
  createSession: async (data: ChatSessionCreate): Promise<ChatSession> => {
    return fetchApi('/chats', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 세션 삭제
  deleteSession: async (chatId: number): Promise<void> => {
    return fetchApi(`/chats/${chatId}`, {
      method: 'DELETE',
    });
  },

  // 세션 메시지 목록 조회
  getMessages: async (chatId: number, skip = 0, limit = 100): Promise<Message[]> => {
    return fetchApi(`/chats/${chatId}/messages?skip=${skip}&limit=${limit}`);
  },
};

// 채팅 완성 API
export const chatApi = {
  // 메시지 전송 (스트리밍)
  sendMessage: async (request: ChatCompletionRequest): Promise<ReadableStream> => {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Chat API Error: ${response.status} ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error('No response body for streaming');
    }

    return response.body;
  },
};

// 헬스체크 API
export const healthApi = {
  check: async (): Promise<HealthResponse> => {
    return fetchApi('/health');
  },
};

// 통합된 API 객체 (기존 코드와의 호환성을 위해)
export const api = {
  ...sessionApi,
  ...chatApi,
  ...healthApi,
};

// 개별 API 함수들도 export (더 직관적인 사용을 위해)
export const {
  getSessions,
  getSession,
  createSession,
  deleteSession,
  getMessages,
  sendMessage,
  check: checkHealth,
} = {
  ...sessionApi,
  ...chatApi,
  ...healthApi,
};

// 기본 export
export default api;
