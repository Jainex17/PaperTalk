import { Source } from '@/types';
import { authFetch } from './client';

interface AskResponse {
  answer: string;
  sources?: Source[];
}

export const sendMessage = async (spaceId: string, query: string, isFirstMessage: boolean = false): Promise<AskResponse> => {
  try {
    const response = await authFetch('/ask', {
      method: 'POST',
      body: JSON.stringify({
        space_id: spaceId,
        query,
        is_first_message: isFirstMessage,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get response');
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};
