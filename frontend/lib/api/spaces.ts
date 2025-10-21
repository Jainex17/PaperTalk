import { Space } from '@/types';
import { authFetch } from './client';

export const getSpaces = async (): Promise<Space[]> => {
  try {
    const res = await authFetch('/spaces', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch spaces');
    return await res.json();
  } catch (error) {
    console.error('Error fetching spaces:', error);
    throw error;
  }
};

export const getSpace = async (spaceId: string): Promise<Space> => {
  try {
    const res = await authFetch(`/spaces/${spaceId}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch space');
    return await res.json();
  } catch (error) {
    console.error('Error fetching space:', error);
    throw error;
  }
};

export const updateSpaceName = async (spaceId: string, newName: string): Promise<Space> => {
  try {
    const response = await authFetch(`/spaces/${spaceId}`, {
      method: 'PATCH',
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

export const deleteSpace = async (spaceId: string): Promise<void> => {
  try {
    const response = await authFetch(`/spaces/${spaceId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete space');
    }
  } catch (error) {
    console.error('Error deleting space:', error);
    throw error;
  }
};
