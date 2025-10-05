import { API_URL } from '../config';
import { Space } from '@/types';

export const getSpaces = async (): Promise<Space[]> => {
  try {
    const res = await fetch(`${API_URL}/spaces`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch spaces');
    return await res.json();
  } catch (error) {
    console.error('Error fetching spaces:', error);
    throw error;
  }
};

export const getSpace = async (spaceId: string): Promise<Space> => {
  try {
    const res = await fetch(`${API_URL}/spaces/${spaceId}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch space');
    return await res.json();
  } catch (error) {
    console.error('Error fetching space:', error);
    throw error;
  }
};

export const updateSpaceName = async (spaceId: string, newName: string): Promise<Space> => {
  try {
    const response = await fetch(`${API_URL}/spaces/${spaceId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        new_name: newName,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update space name');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating space name:', error);
    throw error;
  }
};
