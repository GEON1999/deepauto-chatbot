'use client';

import React from 'react';
import { Button } from '@/components/ui';

// Helper function to adjust time by adding 9 hours
const adjustTimeForKST = (timestamp: Date): Date => {
  const adjustedTime = new Date(timestamp);
  adjustedTime.setHours(adjustedTime.getHours() + 9);
  return adjustedTime;
};

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
  onDeleteSession?: (sessionId: string) => void; // Added delete session handler
  isOpen: boolean;
  onToggle: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
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
        absolute top-0 left-0 h-screen bg-neutral-800 border-r border-neutral-700 z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0 lg:z-auto lg:h-screen
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
                      {adjustTimeForKST(session.timestamp).toLocaleDateString([], {
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
                          ? 'text-gray-100'
                          : 'text-neutral-400'
                      }`}
                    >
                      {adjustTimeForKST(session.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {onDeleteSession && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation(); // 버블링 방지
                          onDeleteSession(session.id);
                        }}
                        className={`p-1 rounded-md hover:bg-red-500 ${
                          activeSessionId === session.id
                            ? 'text-gray-100'
                            : 'text-neutral-400'
                        }`}
                        aria-label="채팅 삭제"
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-4 w-4" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                          />
                        </svg>
                      </button>
                    )}
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
