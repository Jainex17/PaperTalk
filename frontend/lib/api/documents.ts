import { API_URL } from '../config';

export const getDocuments = async (spaceId: string): Promise<string[]> => {
  try {
    const response = await fetch(`${API_URL}/getdocuments/${spaceId}`);
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

    const response = await fetch(`${API_URL}/uploadpdf`, {
      method: 'POST',
      body: formData,
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
