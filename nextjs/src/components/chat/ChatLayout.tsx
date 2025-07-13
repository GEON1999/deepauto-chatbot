'use client';

import React, { useState, useCallback, useEffect } from 'react';
import ChatSidebar, { ChatSession } from './ChatSidebar';
import ChatInterface from './ChatInterface';
import { Message } from './MessageList';

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
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>('');
  const [sessionMessages, setSessionMessages] = useState<
    Record<string, Message[]>
  >({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Generate unique session ID
  const generateSessionId = (): string => {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Generate session title from first message
  const generateSessionTitle = (firstMessage: string): string => {
    return firstMessage.length > 30
      ? firstMessage.substring(0, 30) + '...'
      : firstMessage;
  };

  // Create new chat session
  const handleNewChat = useCallback(() => {
    const newSessionId = generateSessionId();
    const newSession: ChatSession = {
      id: newSessionId,
      title: '새 채팅',
      timestamp: new Date(),
      messageCount: 0,
    };

    setSessions(prev => {
      // Check if session already exists to prevent duplicates
      const existingSession = prev.find(s => s.id === newSessionId);
      if (existingSession) {
        console.warn('Session ID collision detected, regenerating...');
        return prev;
      }
      return [newSession, ...prev];
    });
    setActiveSessionId(newSessionId);
    setSessionMessages(prev => ({
      ...prev,
      [newSessionId]: [],
    }));
    setIsSidebarOpen(false); // Close sidebar on mobile after creating new chat
  }, []);

  // Select existing session
  const handleSelectSession = useCallback(
    (sessionId: string) => {
      if (sessionId !== activeSessionId) {
        setActiveSessionId(sessionId);
        setIsSidebarOpen(false); // Close sidebar on mobile after selecting
      }
    },
    [activeSessionId]
  );

  // Handle sending message
  const handleSendMessage = useCallback(
    async (messageText: string) => {
      if (!activeSessionId) return '';

      // Add user message
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        message: messageText,
        isUser: true,
        timestamp: new Date(),
      };

      setSessionMessages(prev => ({
        ...prev,
        [activeSessionId]: [...(prev[activeSessionId] || []), userMessage],
      }));

      // Update session info
      setSessions(prev =>
        prev.map(session => {
          if (session.id === activeSessionId) {
            const isFirstMessage = session.messageCount === 0;
            return {
              ...session,
              title: isFirstMessage
                ? generateSessionTitle(messageText)
                : session.title,
              lastMessage: messageText,
              timestamp: new Date(),
              messageCount: session.messageCount + 1,
            };
          }
          return session;
        })
      );

      // Get bot response
      try {
        const response = onSendMessage
          ? await onSendMessage(messageText, activeSessionId)
          : `메시지를 받았습니다: "${messageText}"`;

        const botMessage: Message = {
          id: `bot-${Date.now()}`,
          message: response,
          isUser: false,
          timestamp: new Date(),
        };

        setSessionMessages(prev => ({
          ...prev,
          [activeSessionId]: [
            ...(prev[activeSessionId] || []),
            userMessage,
            botMessage,
          ],
        }));

        // Update session with bot response
        setSessions(prev =>
          prev.map(session => {
            if (session.id === activeSessionId) {
              return {
                ...session,
                lastMessage: response,
                timestamp: new Date(),
                messageCount: session.messageCount + 1,
              };
            }
            return session;
          })
        );

        return response;
      } catch (error) {
        console.error('Error sending message:', error);
        return '죄송합니다. 메시지 전송 중 오류가 발생했습니다.';
      }
    },
    [activeSessionId, onSendMessage]
  );

  // Initialize with first session (only once)
  useEffect(() => {
    if (sessions.length === 0 && !activeSessionId) {
      handleNewChat();
    }
  }, []); // Empty dependency array to run only once

  return (
    <div className={`flex h-full bg-neutral-900 ${className}`}>
      {/* Sidebar */}
      <ChatSidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Mobile Header */}
        <div className="lg:hidden bg-neutral-800 border-b border-neutral-700 p-4 flex items-center justify-between">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 text-neutral-400 hover:text-neutral-100"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-neutral-100">
            {sessions.find(s => s.id === activeSessionId)?.title || 'AI 챗봇'}
          </h1>
          <div className="w-9" /> {/* Spacer for centering */}
        </div>

        {/* Chat Interface */}
        {activeSessionId ? (
          <ChatInterface
            key={activeSessionId} // Force re-render when session changes
            initialMessages={sessionMessages[activeSessionId] || []}
            onSendMessage={handleSendMessage}
            className="flex-1"
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-neutral-400">
            <div className="text-center">
              <p className="text-lg mb-2">채팅을 선택하거나 새로 시작하세요</p>
              <button
                onClick={handleNewChat}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                새 채팅 시작
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatLayout;
