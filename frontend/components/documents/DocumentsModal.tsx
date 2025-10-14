'use client';

import { useRef, useState } from 'react';
import { X, FileText, Loader2, Trash2, Upload, Type } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Document } from '@/types';
import { MAX_FILES_FREE, MAX_TEXT_CHARACTERS } from '@/lib/config';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface DocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: Document[];
  loadingDocuments: boolean;
  onFileUpload: (file: File) => Promise<void>;
  onTextUpload: (text: string) => Promise<void>;
  onDeleteDocument: (documentId: string, documentName: string) => Promise<void>;
}

export function DocumentsModal({
  isOpen,
  onClose,
  documents,
  loadingDocuments,
  onFileUpload,
  onTextUpload,
  onDeleteDocument,
}: DocumentsModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<{ id: string; name: string } | null>(null);
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null);
  const [showUploadOptions, setShowUploadOptions] = useState(false);
  const [uploadMode, setUploadMode] = useState<'file' | 'text'>('file');
  const [textContent, setTextContent] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && (selectedFile.type === 'application/pdf' || selectedFile.type === 'text/plain')) {
      try {
        await onFileUpload(selectedFile);
        setShowUploadOptions(false);
      } catch {
        alert('Failed to upload file. Please try again.');
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleTextUpload = async () => {
    if (!textContent.trim()) {
      alert('Please enter some text to upload.');
      return;
    }

    if (textContent.length > MAX_TEXT_CHARACTERS) {
      alert(`Text exceeds maximum length of ${MAX_TEXT_CHARACTERS.toLocaleString()} characters.`);
      return;
    }

    setIsUploading(true);
    try {
      await onTextUpload(textContent);
      setTextContent('');
      setUploadMode('file');
      setShowUploadOptions(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload text. Please try again.';
      alert(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCloseModal = () => {
    setShowUploadOptions(false);
    setUploadMode('file');
    setTextContent('');
    onClose();
  };

  const handleDeleteClick = (doc: Document) => {
    if (doc.id) {
      setDocumentToDelete({ id: doc.id, name: doc.name });
      setDeleteConfirmOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (documentToDelete) {
      setDeletingDocId(documentToDelete.id);
      try {
        await onDeleteDocument(documentToDelete.id, documentToDelete.name);
      } catch {
        alert('Failed to delete document. Please try again.');
      } finally {
        setDeletingDocId(null);
        setDocumentToDelete(null);
      }
    }
  };


  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseModal}
            className="fixed inset-0 bg-black/50 z-40"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-x-hidden"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                handleCloseModal();
              }
            }}
          >
            <div className="bg-card rounded-2xl p-8 w-full max-w-4xl h-[50vh] flex flex-col" style={{ boxShadow: 'var(--shadow-2xl)' }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-card-foreground">
                  {showUploadOptions ? 'Upload Document' : 'Project files'}
                </h2>
                <div className="flex items-center gap-3">
                  {!showUploadOptions && (
                    <button
                      onClick={() => setShowUploadOptions(true)}
                      className="px-4 py-2 border border-border flex items-center gap-2 cursor-pointer justify-center bg-secondary text-secondary-foreground rounded-lg hover:opacity-90 transition-all text-sm font-medium"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Upload Document</span>
                    </button>
                  )}
                  <button
                    onClick={handleCloseModal}
                    className="px-2 py-2 border border-border flex items-center cursor-pointer justify-center bg-secondary text-secondary-foreground rounded-lg hover:opacity-90 transition-all text-sm font-medium"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Upload mode tabs - only show when upload button clicked */}
              {showUploadOptions && (
                <div className="flex gap-2 mb-4 border-b border-border">
                  <button
                    onClick={() => setUploadMode('file')}
                    className={`px-4 py-2 flex items-center gap-2 transition-all ${
                      uploadMode === 'file'
                        ? 'text-primary border-b-2 border-primary font-medium'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Files</span>
                  </button>
                  <button
                    onClick={() => setUploadMode('text')}
                    className={`px-4 py-2 flex items-center gap-2 transition-all ${
                      uploadMode === 'text'
                        ? 'text-primary border-b-2 border-primary font-medium'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Type className="w-4 h-4" />
                    <span>Paste Text</span>
                  </button>
                </div>
              )}

              <div className="flex-1 overflow-y-auto space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {showUploadOptions ? (
                  <>
                    {/* Text input mode */}
                    {uploadMode === 'text' && (
                      <div className="flex flex-col gap-3 h-full">
                        <textarea
                          value={textContent}
                          onChange={(e) => {
                            if (e.target.value.length <= MAX_TEXT_CHARACTERS) {
                              setTextContent(e.target.value);
                            }
                          }}
                          placeholder="Paste or type your text here..."
                          className={`flex-1 w-full p-4 border rounded-xl bg-background text-foreground resize-none focus:outline-none transition-all ${
                            textContent.length > MAX_TEXT_CHARACTERS
                              ? 'border-destructive focus:border-destructive'
                              : 'border-border focus:border-border'
                          }`}
                          disabled={isUploading}
                          maxLength={MAX_TEXT_CHARACTERS}
                        />
                        <div className="flex items-center justify-between">
                          <p className={`text-xs ${
                            textContent.length > MAX_TEXT_CHARACTERS * 0.9
                              ? 'text-orange-500 font-medium'
                              : 'text-muted-foreground'
                          }`}>
                            {textContent.length.toLocaleString()} / {MAX_TEXT_CHARACTERS.toLocaleString()} characters
                          </p>
                          <button
                            onClick={handleTextUpload}
                            disabled={!textContent.trim() || isUploading || textContent.length > MAX_TEXT_CHARACTERS}
                            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            {isUploading ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              'Upload Text'
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* File upload mode */}
                    {uploadMode === 'file' && (
                      <div
                        className="flex flex-col items-center justify-center h-full border-2 border-dashed border-border rounded-xl text-center hover:border-primary/50 transition-colors cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <p className="text-lg font-medium text-foreground mb-2">Click to choose files</p>
                        <p className="text-sm text-muted-foreground">or drag and drop</p>
                        <p className="text-xs text-muted-foreground mt-2">PDF or TXT files (max {MAX_FILES_FREE} files)</p>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {/* Document list view */}
                    {documents.length >= MAX_FILES_FREE && (
                      <div className="bg-muted rounded-xl p-4">
                        <h3 className="text-sm font-semibold text-foreground mb-1">File limit reached</h3>
                        <p className="text-sm text-muted-foreground">
                          You can add up to {MAX_FILES_FREE} files on the free plan. Upgrade to plus to add 25 files.
                        </p>
                      </div>
                    )}

                    {loadingDocuments ? (
                      <div className="grid gap-2">
                        {[...Array(3)].map((_, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-4 p-2 border border-border/50 rounded-xl animate-pulse"
                          >
                            <div className="w-12 h-12 rounded-lg bg-muted flex-shrink-0" />
                            <div className="flex-1 min-w-0 space-y-2">
                              <div className="h-4 bg-muted rounded w-3/4" />
                              <div className="h-3 bg-muted rounded w-1/4" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : documents.length > 0 ? (
                      <div className="grid gap-2">
                        {documents.map((doc, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center gap-4 p-2 hover:bg-muted/50 border border-border/50 shadow rounded-xl transition-colors group"
                          >
                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                              {doc.isUploading || deletingDocId === doc.id ? (
                                <Loader2 className="w-6 h-6 text-primary animate-spin" />
                              ) : (
                                <FileText className="w-6 h-6 text-primary" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-foreground truncate">{doc.name}</p>
                              <p className="text-xs text-muted-foreground">{doc.type}</p>
                            </div>
                            {!doc.isUploading && doc.id && (
                              <button
                                onClick={() => handleDeleteClick(doc)}
                                className="opacity-0 group-hover:opacity-100 p-2 hover:bg-destructive/10 rounded-lg transition-all"
                                title="Delete document"
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </button>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-16">
                        <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                        <p className="text-sm text-muted-foreground">No files uploaded yet</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Click &quot;Upload Document&quot; to get started
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </motion.div>

          <ConfirmDialog
            isOpen={deleteConfirmOpen}
            onClose={() => {
              setDeleteConfirmOpen(false);
              setDocumentToDelete(null);
            }}
            onConfirm={handleConfirmDelete}
            title="Delete document?"
            message="Are you sure you want to delete this document? This will remove all chunks associated with this document from the space."
            confirmText="Delete"
            cancelText="Cancel"
          />
        </>
      )}
    </AnimatePresence>
  );
}
