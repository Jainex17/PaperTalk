'use client';

import { useRef, useEffect } from 'react';
import { Message } from '@/types';
import { MessageBubble } from './MessageBubble';

interface MessageListProps {
  messages: Message[];
  loading: boolean;
}

export function MessageList({ messages, loading }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="p-8 pb-52 space-y-6 max-w-3xl mx-auto w-full flex flex-col overflow-y-auto h-[95vh] scrollbar-hidden">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
      {loading && (
        <div className="flex justify-start">
          <svg className="w-16 h-9" viewBox="0 0 60 16">
            <circle fill="currentColor" cx="6" cy="8" r="4">
              <animate attributeName="opacity" dur="1s" values="0;1;0" repeatCount="indefinite" begin="0.1" />
            </circle>
            <circle fill="currentColor" cx="26" cy="8" r="4">
              <animate attributeName="opacity" dur="1s" values="0;1;0" repeatCount="indefinite" begin="0.2" />
            </circle>
            <circle fill="currentColor" cx="46" cy="8" r="4">
              <animate attributeName="opacity" dur="1s" values="0;1;0" repeatCount="indefinite" begin="0.3" />
            </circle>
          </svg>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
