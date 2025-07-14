'use client';

import React from 'react';

// Helper function to adjust time by adding 9 hours
const adjustTimeForKST = (timestamp: Date): Date => {
  const adjustedTime = new Date(timestamp);
  adjustedTime.setHours(adjustedTime.getHours() + 9);
  return adjustedTime;
};

export interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp: Date;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isUser,
  timestamp,
}) => {
  return (
    <div
      className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          isUser ? 'bg-gray-500 text-white' : 'bg-neutral-700 text-neutral-100'
        }`}
      >
        <p className="text-sm">{message}</p>
        <p
          className={`text-xs mt-1 ${
            isUser ? 'text-gray-100' : 'text-neutral-400'
          }`}
        >
          {adjustTimeForKST(timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  );
};

export default ChatMessage;
