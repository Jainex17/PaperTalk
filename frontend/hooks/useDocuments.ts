import { useState, useEffect } from 'react';
import { Document } from '@/types';
import { getDocuments as getDocumentsAPI, uploadDocument as uploadDocumentAPI, deleteDocument as deleteDocumentAPI } from '@/lib/api/documents';
import { getFileType } from '@/lib/utils';

export const useDocuments = (spaceId: string) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(true);

  const fetchDocuments = async () => {
    setLoadingDocuments(true);
    try {
      const docs = await getDocumentsAPI(spaceId);
      const formattedDocs: Document[] = docs.map((doc: string) => ({
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

  const deleteDocument = async (documentId: string) => {
    try {
      await deleteDocumentAPI(spaceId, documentId);
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
    } catch (error) {
      console.error('Delete error:', error);
      throw error;
    }
  };

  return { documents, loadingDocuments, uploadDocument, deleteDocument, refetch: fetchDocuments };
};
