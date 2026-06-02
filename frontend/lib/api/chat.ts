import { Source } from '@/types';
import { authFetch } from './client';

interface AskResponse {
  answer: string;
  sources?: Source[];
}

export const sendMessage = async (spaceId: string, query: string, isFirstMessage: boolean = false, provider?: 'openrouter' | 'gemini', model?: string): Promise<AskResponse> => {
  const response = await authFetch('/ask', {
    method: 'POST',
    body: JSON.stringify({
      space_id: spaceId,
      query,
      is_first_message: isFirstMessage,
      answer_provider: provider,
      answer_model: model,
    }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw { status: response.status, message: body.detail || 'Failed to get response' };
  }

  return await response.json();
};
