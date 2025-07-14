'use client';

import React, { useState, useCallback, useEffect } from 'react';
import MessageList, { Message } from './MessageList';
import MessageInput from './MessageInput';

export interface ChatInterfaceProps {
  onSendMessage?: (message: string) => Promise<string> | string;
  initialMessages?: Message[];
  className?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  onSendMessage,
  initialMessages = [],
  className = '',
}) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);

  // initialMessages가 변경될 때마다 messages 상태 업데이트
  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  const handleSendMessage = useCallback(
    async (messageText: string) => {
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        message: messageText,
        isUser: true,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, userMessage]);

      setIsLoading(true);

      try {
        if (onSendMessage) {
          const response = await onSendMessage(messageText);

          const botMessage: Message = {
            id: `bot-${Date.now()}`,
            message: response,
            isUser: false,
            timestamp: new Date(),
          };

          setMessages(prev => [...prev, botMessage]);
        } else {
          setTimeout(() => {
            const botMessage: Message = {
              id: `bot-${Date.now()}`,
              message: `메시지를 받았습니다: "${messageText}"`,
              isUser: false,
              timestamp: new Date(),
            };
            setMessages(prev => [...prev, botMessage]);
          }, 1000);
        }
      } catch (error) {
        console.error('Error sending message:', error);

        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          message: '죄송합니다. 메시지 전송 중 오류가 발생했습니다.',
          isUser: false,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [onSendMessage]
  );

  return (
    <div className={`flex flex-col h-full bg-neutral-900 ${className}`}>
      {/* Header */}
      <div className="border-b border-neutral-700 bg-neutral-800 px-4 py-3">
        <h1 className="text-lg font-semibold text-neutral-100">AI 챗봇</h1>
        <p className="text-sm text-neutral-400">
          궁금한 것을 자유롭게 물어보세요!
        </p>
      </div>

      {/* Messages */}
      <MessageList messages={messages} isLoading={isLoading} />

      {/* Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        disabled={isLoading}
        placeholder="메시지를 입력하세요..."
      />
    </div>
  );
};

export default ChatInterface;
