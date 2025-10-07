import { API_URL } from '../config';
import { Source } from '@/types';

interface AskResponse {
  answer: string;
  sources?: Source[];
}

export const sendMessage = async (spaceId: string, query: string, isFirstMessage: boolean = false): Promise<AskResponse> => {
  try {
    const response = await fetch(`${API_URL}/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
