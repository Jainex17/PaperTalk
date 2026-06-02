import { useState } from 'react';
import { toast } from 'sonner';
import { Message } from '@/types';
import { sendMessage as sendMessageAPI } from '@/lib/api/chat';

export const useMessages = (spaceId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (input: string, provider?: 'openrouter' | 'gemini', model?: string) => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const isFirstMessage = messages.length === 0;
      const data = await sendMessageAPI(spaceId, input, isFirstMessage, provider, model);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.answer,
        timestamp: new Date(),
        sources: data.sources,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: unknown) {
      const err = error as { status?: number; message?: string };

      if (err.status === 429) {
        toast.error('Provider credits exhausted', {
          description: 'The selected AI provider has run out of credits. Switch to another provider or try again later.',
          duration: 6000,
        });
      } else {
        toast.error('Failed to get response', {
          description: 'An unexpected error occurred. Please try again.',
          duration: 4000,
        });
      }

      if (err.status !== 429) {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: 'Sorry, I encountered an error processing your request. Please try again.',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return { messages, loading, sendMessage, clearMessages };
};
