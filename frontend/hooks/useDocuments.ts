import { useState, useEffect } from 'react';
import { Document } from '@/types';
import { getSpaceDetails, uploadDocument as uploadDocumentAPI, uploadText as uploadTextAPI, deleteDocument as deleteDocumentAPI } from '@/lib/api/documents';
import { getFileType } from '@/lib/utils';

export const useDocuments = (spaceId: string) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const [spaceName, setSpaceName] = useState<string>('');

  const fetchDocuments = async () => {
    setLoadingDocuments(true);
    try {
      const spaceDetails = await getSpaceDetails(spaceId);
      setSpaceName(spaceDetails.name);
      const formattedDocs: Document[] = spaceDetails.documents.map((doc: string) => ({
        id: doc,
        name: doc,
        type: getFileType(doc),
        isUploading: false
      }));
      setDocuments(formattedDocs);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoadingDocuments(false);
    }
  };

  useEffect(() => {
    // Reset state when space ID changes
    setSpaceName('');
    setDocuments([]);
    setLoadingDocuments(true);

    fetchDocuments();
  }, [spaceId]);

  const uploadDocument = async (file: File) => {
    const newDoc: Document = {
      name: file.name,
      uploadedAt: new Date(),
      type: getFileType(file.name),
      isUploading: true
    };

    setDocuments(prev => [...prev, newDoc]);

    try {
      await uploadDocumentAPI(spaceId, file);

      setDocuments(prev =>
        prev.map(doc =>
          doc.name === file.name
            ? { ...doc, id: file.name, isUploading: false }
            : doc
        )
      );
    } catch (error) {
      console.error('Upload error:', error);
      setDocuments(prev => prev.filter(doc => doc.name !== file.name));
      throw error;
    }
  };

  const uploadText = async (textContent: string) => {
    // Generate a temporary name from first few words
    const tempName = textContent.trim().substring(0, 30).replace(/\s+/g, '_') + '.txt';

    const newDoc: Document = {
      name: tempName,
      uploadedAt: new Date(),
      type: 'text',
      isUploading: true
    };

    setDocuments(prev => [...prev, newDoc]);

    try {
      const result = await uploadTextAPI(spaceId, textContent);
      const finalFilename = result.filename || result.fileid;

      setDocuments(prev =>
        prev.map(doc =>
          doc.name === tempName
            ? { ...doc, id: result.fileid, name: finalFilename, isUploading: false }
            : doc
        )
      );
    } catch (error) {
      console.error('Text upload error:', error);
      setDocuments(prev => prev.filter(doc => doc.name !== tempName));
      throw error;
    }
  };

  const deleteDocument = async (documentId: string) => {
    try {
      await deleteDocumentAPI(spaceId, documentId);
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
    } catch (error) {
      console.error('Delete error:', error);
      throw error;
    }
  };

  return { documents, loadingDocuments, spaceName, uploadDocument, uploadText, deleteDocument, refetch: fetchDocuments };
};
