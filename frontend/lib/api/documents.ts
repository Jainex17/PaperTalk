import { authFetch, getAuthToken } from './client';
import { API_URL } from '../config';

export const getDocuments = async (spaceId: string): Promise<string[]> => {
  try {
    const response = await authFetch(`/getdocuments/${spaceId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch documents');
    }
    const data = await response.json();
    return data.documents || [];
  } catch (error) {
    console.error('Error fetching documents:', error);
    throw error;
  }
};

export const uploadDocument = async (spaceId: string, file: File): Promise<{ message: string }> => {
  try {
    const formData = new FormData();
    formData.append('space_id', spaceId);
    formData.append('file', file);

    const token = getAuthToken();
    const headers: HeadersInit = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/uploadpdf`, {
      method: 'POST',
      headers,
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

export const deleteDocument = async (spaceId: string, fileId: string): Promise<{ message: string }> => {
  try {
    const response = await authFetch(`/documents/${spaceId}/${encodeURIComponent(fileId)}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Delete failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Delete error:', error);
    throw error;
  }
};
