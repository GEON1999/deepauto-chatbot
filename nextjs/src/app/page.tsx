'use client';

import { ChatLayout } from '@/components/chat';

// Demo message handler - simulates chatbot responses
const handleSendMessage = async (
  message: string,
  sessionId: string
): Promise<string> => {
  // Simulate API delay
  await new Promise(resolve =>
    setTimeout(resolve, 1000 + Math.random() * 1000)
  );

  // Simple response logic for demo
  const responses = [`message: ${message}`];

  return responses[Math.floor(Math.random() * responses.length)];
};

export default function Home() {
  return (
    <div className="h-screen bg-neutral-900">
      <ChatLayout onSendMessage={handleSendMessage} className="h-full" />
    </div>
  );
}
