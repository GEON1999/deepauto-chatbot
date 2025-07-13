'use client';

import React from 'react';
import { Button } from '@/components/ui';

export interface ChatSession {
  id: string;
  title: string;
  lastMessage?: string;
  timestamp: Date;
  messageCount: number;
}

export interface ChatSidebarProps {
  sessions: ChatSession[];
  activeSessionId?: string;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  isOpen,
  onToggle,
}) => {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed top-0 left-0 h-full bg-neutral-800 border-r border-neutral-700 z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0 lg:z-auto
        w-80 flex flex-col
      `}
      >
        {/* Header */}
        <div className="p-4 border-b border-neutral-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-neutral-100">
              채팅 목록
            </h2>
            <button
              onClick={onToggle}
              className="lg:hidden p-2 text-neutral-400 hover:text-neutral-100"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* New Chat Button */}
          <Button onClick={onNewChat} variant="primary" className="w-full">
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            새 채팅
          </Button>
        </div>

        {/* Session List */}
        <div className="flex-1 overflow-y-auto p-4">
          {sessions.length === 0 ? (
            <div className="text-center text-neutral-400 mt-8">
              <p>아직 채팅이 없습니다.</p>
              <p className="text-sm mt-1">새 채팅을 시작해보세요!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sessions.map(session => (
                <div
                  key={session.id}
                  onClick={() => onSelectSession(session.id)}
                  className={`
                    p-3 rounded-lg cursor-pointer transition-colors
                    ${
                      activeSessionId === session.id
                        ? 'bg-gray-500 text-white'
                        : 'bg-neutral-700 hover:bg-neutral-600 text-neutral-100'
                    }
                  `}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-medium text-sm truncate flex-1 mr-2">
                      {session.title}
                    </h3>
                    <span
                      className={`text-xs ${
                        activeSessionId === session.id
                          ? 'text-gray-100'
                          : 'text-neutral-400'
                      }`}
                    >
                      {session.timestamp.toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  {session.lastMessage && (
                    <p
                      className={`text-xs truncate ${
                        activeSessionId === session.id
                          ? 'text-gray-100'
                          : 'text-neutral-400'
                      }`}
                    >
                      {session.lastMessage}
                    </p>
                  )}

                  <div className="flex justify-between items-center mt-2">
                    <span
                      className={`text-xs ${
                        activeSessionId === session.id
                          ? 'text-gray-200'
                          : 'text-neutral-500'
                      }`}
                    >
                      {session.messageCount}개 메시지
                    </span>
                    <span
                      className={`text-xs ${
                        activeSessionId === session.id
                          ? 'text-gray-100'
                          : 'text-neutral-400'
                      }`}
                    >
                      {session.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ChatSidebar;
