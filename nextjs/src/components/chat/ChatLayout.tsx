'use client';

import React, { useState, useCallback, useEffect } from 'react';
import ChatSidebar from './ChatSidebar';
import ChatInterface from './ChatInterface';
import {
  getSessions,
  createSession,
  getMessages,
  sendMessage,
  sessionApi,
} from '../../services/api';
import { ChatSession } from './ChatSidebar';
import { Message } from './MessageList';
import { UIMessage, UISession, ChatState, StreamingState } from './types';

export interface ChatLayoutProps {
  onSendMessage?: (
    message: string,
    sessionId: string
  ) => Promise<string> | string;
  className?: string;
}

const ChatLayout: React.FC<ChatLayoutProps> = ({
  onSendMessage,
  className = '',
}) => {
  // API 연동 상태 관리
  const [chatState, setChatState] = useState<ChatState>({
    sessions: [],
    sessionMessages: {},
    activeSessionId: '',
    isLoading: false,
    error: null,
    isConnected: false,
  });

  const [streamingState, setStreamingState] = useState<StreamingState>({
    isStreaming: false,
    streamingMessageId: null,
    streamingContent: '',
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 초기 데이터 로드
  useEffect(() => {
    loadInitialData();
  }, []);

  // 세션 목록 로드 함수 - 재사용을 위해 분리
  const loadSessions = async (preserveActiveSession = false) => {
    try {
      const sessions = await getSessions();
      const uiSessions: UISession[] = sessions.map(session => ({
        id: session.id.toString(),
        title: session.title,
        timestamp: new Date(session.created_at),
        messageCount: 0, // API에서 제공하지 않으므로 기본값
        lastMessage: undefined, // API에서 제공하지 않으므로 기본값
      }));

      // 활성화된 세션 유지 로직
      let newActiveSessionId = uiSessions[0]?.id || '';
      if (preserveActiveSession && chatState.activeSessionId) {
        // 현재 활성화된 세션이 삭제되지 않았는지 확인
        const sessionStillExists = uiSessions.some(
          session => session.id === chatState.activeSessionId
        );
        if (sessionStillExists) {
          newActiveSessionId = chatState.activeSessionId;
        }
      }

      setChatState(prev => ({
        ...prev,
        sessions: uiSessions,
        activeSessionId: newActiveSessionId,
        isLoading: false,
        isConnected: true,
      }));

      return uiSessions;
    } catch (error) {
      console.error('세션 목록 로드 실패:', error);
      setChatState(prev => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : '세션 목록 로드에 실패했습니다.',
      }));
      return [];
    }
  };

  // 초기 데이터 로드
  const loadInitialData = async () => {
    setChatState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // 세션 목록 로드 (API 연결 확인 겪용)
      const uiSessions = await loadSessions();

      // 첫 번째 세션의 메시지 로드
      if (uiSessions[0]) {
        await loadSessionMessages(uiSessions[0].id);
      }
    } catch (error) {
      console.error('초기 데이터 로드 실패:', error);
      setChatState(prev => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : '데이터 로드에 실패했습니다.',
        isConnected: false,
      }));
    }
  };

  const loadSessionMessages = async (sessionId: string) => {
    try {
      // sessionId를 숫자로 변환
      const chatId = parseInt(sessionId);
      const messages = await getMessages(chatId);

      const uiMessages: UIMessage[] = messages.map(msg => ({
        id: msg.id.toString(),
        message: msg.content,
        isUser: msg.role === 'user',
        timestamp: new Date(msg.created_at),
      }));

      setChatState(prev => ({
        ...prev,
        sessionMessages: {
          ...prev.sessionMessages,
          [sessionId]: uiMessages,
        },
      }));
    } catch (error) {
      console.error('메시지 로드 실패:', error);
    }
  };

  // 새 채팅 세션 생성
  const handleNewChat = useCallback(async () => {
    setChatState(prev => ({ ...prev, isLoading: true }));

    try {
      const newSession = await createSession({ title: '' });
      const uiSession: UISession = {
        id: newSession.id.toString(),
        title: newSession.title,
        timestamp: new Date(newSession.created_at),
        messageCount: 0,
      };

      setChatState(prev => ({
        ...prev,
        sessions: [uiSession, ...prev.sessions],
        activeSessionId: uiSession.id,
        sessionMessages: {
          ...prev.sessionMessages,
          [uiSession.id]: [],
        },
        isLoading: false,
      }));

      setIsSidebarOpen(false);
    } catch (error) {
      console.error('새 채팅 생성 실패:', error);
      setChatState(prev => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : '새 채팅 생성에 실패했습니다.',
      }));
    }
  }, []);

  // 채팅 세션 삭제
  const handleDeleteSession = useCallback(
    async (sessionId: string) => {
      if (!window.confirm('정말로 이 채팅을 삭제하시겠습니까?')) {
        return;
      }

      // 기존 UI 유지를 위해 상태를 보존하면서 로딩상태로 변경
      setChatState(prev => ({
        ...prev,
        isLoading: true,
        // 세션 목록과 메세지는 로딩 중에도 유지
      }));

      try {
        // sessionId를 숫자로 변환
        const chatId = parseInt(sessionId);

        // 삭제를 시도하기 전에 현재 액티브 세션을 먼저 체크
        const isActiveSession = sessionId === chatState.activeSessionId;
        const currentActiveSessions = [...chatState.sessions];
        const nextAvailableSession = currentActiveSessions.find(
          session => session.id !== sessionId
        );

        // 서버에서 세션 삭제
        await sessionApi.deleteSession(chatId);

        // 삭제된 세션을 상태에서 제거하지만, 데이터가 불완전한 상태에서 UI가 말생하지 않도록
        // 일단 새로운 세션을 선택하고 데이터 로드

        if (isActiveSession && nextAvailableSession) {
          // 현재 삭제한 세션이 활성화된 세션이었다면, 다음 세션을 선택
          await loadSessionMessages(nextAvailableSession.id);
          setChatState(prev => ({
            ...prev,
            activeSessionId: nextAvailableSession.id,
            isLoading: true, // 아직 로드 중
          }));
        }

        // 새로운 세션 목록 가져오기 (UI를 보존하면서)
        await loadSessions(true);
        alert('채팅이 삭제되었습니다.');
      } catch (error) {
        console.error('채팅 삭제 실패:', error);
        setChatState(prev => ({
          ...prev,
          isLoading: false,
          error:
            error instanceof Error
              ? error.message
              : '채팅 삭제에 실패했습니다.',
        }));
        alert('채팅 삭제에 실패했습니다.');

        // 삭제가 실패하면 다시 세션 목록 로드
        await loadSessions(true);
      }
    },
    [chatState.sessions, chatState.activeSessionId, loadSessionMessages]
  );

  // 세션 선택
  const handleSelectSession = useCallback(
    async (sessionId: string) => {
      if (sessionId !== chatState.activeSessionId) {
        setChatState(prev => ({
          ...prev,
          activeSessionId: sessionId,
        }));

        // 해당 세션의 메시지가 없으면 로드
        if (!chatState.sessionMessages[sessionId]) {
          await loadSessionMessages(sessionId);
        }

        setIsSidebarOpen(false);
      }
    },
    [chatState.activeSessionId, chatState.sessionMessages]
  );

  // 메시지 전송
  const handleSendMessage = useCallback(
    async (messageText: string) => {
      if (!chatState.activeSessionId || streamingState.isStreaming) return '';

      const userMessage: UIMessage = {
        id: `user-${Date.now()}`,
        message: messageText,
        isUser: true,
        timestamp: new Date(),
      };

      // 사용자 메시지 즉시 추가
      setChatState(prev => ({
        ...prev,
        sessionMessages: {
          ...prev.sessionMessages,
          [prev.activeSessionId]: [
            ...(prev.sessionMessages[prev.activeSessionId] || []),
            userMessage,
          ],
        },
      }));

      try {
        // 스트리밍 상태 시작
        const streamingMessageId = `ai-${Date.now()}`;
        setStreamingState({
          isStreaming: true,
          streamingMessageId,
          streamingContent: '',
        });

        // AI 응답을 위한 빈 메시지 추가
        setChatState(prev => ({
          ...prev,
          sessionMessages: {
            ...prev.sessionMessages,
            [prev.activeSessionId]: [
              ...prev.sessionMessages[prev.activeSessionId],
              {
                id: streamingMessageId,
                message: '',
                isUser: false,
                timestamp: new Date(),
              },
            ],
          },
        }));

        // 실제 API 호출 및 스트리밍 처리
        const chatId = parseInt(chatState.activeSessionId);
        const responseStream = await sendMessage({
          chat_id: chatId,
          message: messageText,
        });

        // ReadableStream 처리 - SSE 데이터 파싱
        const reader = responseStream.getReader();
        let fullResponse = '';
        let buffer = ''; // SSE 데이터 버퍼

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            // chunk를 텍스트로 변환하고 버퍼에 추가
            const chunk = new TextDecoder().decode(value);
            buffer += chunk;

            // SSE 데이터를 라인별로 처리
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // 마지막 불완전한 라인은 다시 버퍼에 저장

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const jsonStr = line.slice(6); // 'data: ' 제거

                  // [DONE] 체크
                  if (jsonStr.trim() === '[DONE]') {
                    console.log('스트리밍 완료');
                    break;
                  }

                  const data = JSON.parse(jsonStr);

                  // content 추출
                  if (
                    data.choices &&
                    data.choices[0] &&
                    data.choices[0].delta &&
                    data.choices[0].delta.content
                  ) {
                    const content = data.choices[0].delta.content;
                    fullResponse += content;

                    // 스트리밍 상태 업데이트
                    setStreamingState(prev => ({
                      ...prev,
                      streamingContent: fullResponse,
                    }));

                    // 메시지 내용 실시간 업데이트
                    setChatState(prev => ({
                      ...prev,
                      sessionMessages: {
                        ...prev.sessionMessages,
                        [prev.activeSessionId]: prev.sessionMessages[
                          prev.activeSessionId
                        ].map(msg =>
                          msg.id === streamingMessageId
                            ? { ...msg, message: fullResponse }
                            : msg
                        ),
                      },
                    }));
                  }

                  // finish_reason이 있으면 완료
                  if (
                    data.choices &&
                    data.choices[0] &&
                    data.choices[0].finish_reason
                  ) {
                    console.log(
                      '스트리밍 완료 - finish_reason:',
                      data.choices[0].finish_reason
                    );
                    break;
                  }
                } catch (parseError) {
                  console.error('JSON 파싱 오류:', parseError, 'Line:', line);
                  // JSON 파싱 오류는 무시하고 계속 진행
                }
              }
            }
          }
        } catch (streamError) {
          console.error('스트리밍 처리 중 오류:', streamError);
        } finally {
          reader.releaseLock();
        }

        // 스트리밍 완료
        setStreamingState({
          isStreaming: false,
          streamingMessageId: null,
          streamingContent: '',
        });

        return fullResponse;
      } catch (error) {
        console.error('메시지 전송 실패:', error);

        // 에러 메시지 추가
        const errorMessage: UIMessage = {
          id: `error-${Date.now()}`,
          message: '죄송합니다. 오류가 발생했습니다. 다시 시도해주세요.',
          isUser: false,
          timestamp: new Date(),
        };

        setChatState(prev => ({
          ...prev,
          sessionMessages: {
            ...prev.sessionMessages,
            [prev.activeSessionId]: [
              ...prev.sessionMessages[prev.activeSessionId],
              errorMessage,
            ],
          },
          error:
            error instanceof Error
              ? error.message
              : '메시지 전송에 실패했습니다.',
        }));

        // 스트리밍 상태 리셋
        setStreamingState({
          isStreaming: false,
          streamingMessageId: null,
          streamingContent: '',
        });

        return '';
      }
    },
    [chatState.activeSessionId, streamingState.isStreaming]
  );

  // UI에서 사용할 데이터 변환
  const convertToLegacyFormat = () => {
    const legacySessions: ChatSession[] = chatState.sessions.map(session => ({
      id: session.id,
      title: session.title,
      timestamp: session.timestamp,
      messageCount: session.messageCount,
    }));

    const legacyMessages: Message[] = (
      chatState.sessionMessages[chatState.activeSessionId] || []
    ).map(msg => ({
      id: msg.id,
      message: msg.message,
      isUser: msg.isUser,
      timestamp: msg.timestamp,
    }));

    return { legacySessions, legacyMessages };
  };

  const { legacySessions, legacyMessages } = convertToLegacyFormat();

  return (
    <div className={`flex h-screen bg-gray-50 ${className}`}>
      {/* 모바일 오버레이 */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 사이드바 */}
      <div
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-80 h-screen
          transform transition-transform duration-300 ease-in-out lg:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <ChatSidebar
          sessions={legacySessions}
          activeSessionId={chatState.activeSessionId}
          onSelectSession={handleSelectSession}
          onNewChat={handleNewChat}
          onDeleteSession={handleDeleteSession}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      </div>

      {/* 메인 채팅 영역 */}
      <div className="flex-1 flex flex-col">
        {/* 헤더 */}

        {/* 에러 메시지 */}
        {chatState.error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-4 mt-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{chatState.error}</p>
              </div>
            </div>
          </div>
        )}

        {/* 채팅 인터페이스 */}
        <div className="flex-1">
          <ChatInterface
            initialMessages={legacyMessages}
            onSendMessage={handleSendMessage}
            className="h-full"
          />
        </div>
      </div>
    </div>
  );
};

export default ChatLayout;
