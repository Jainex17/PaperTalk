'use client';

import { useRef } from 'react';
import { X, FileText, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Document } from '@/types';
import { MAX_FILES_FREE } from '@/lib/config';

interface DocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: Document[];
  loadingDocuments: boolean;
  onFileUpload: (file: File) => Promise<void>;
}

export function DocumentsModal({
  isOpen,
  onClose,
  documents,
  loadingDocuments,
  onFileUpload,
}: DocumentsModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && (selectedFile.type === 'application/pdf' || selectedFile.type === 'text/plain')) {
      try {
        await onFileUpload(selectedFile);
      } catch {
        alert('Failed to upload file. Please try again.');
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
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
            onClick={onClose}
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
                onClose();
              }
            }}
          >
            <div className="bg-card rounded-2xl p-8 w-full max-w-4xl h-[50vh] flex flex-col" style={{ boxShadow: 'var(--shadow-2xl)' }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-card-foreground">Project files</h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 border border-border flex items-center cursor-pointer justify-center bg-secondary text-secondary-foreground rounded-lg hover:opacity-90 transition-all text-md font-medium"
                  >
                    <span>Upload Documents</span>
                  </button>
                  <button
                    onClick={onClose}
                    className="px-2 py-2 border border-border flex items-center cursor-pointer justify-center bg-secondary text-secondary-foreground rounded-lg hover:opacity-90 transition-all text-md font-medium"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />

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
                          {doc.isUploading ? (
                            <Loader2 className="w-6 h-6 text-primary animate-spin" />
                          ) : (
                            <FileText className="w-6 h-6 text-primary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">{doc.type}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="text-sm text-muted-foreground">No files uploaded yet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Click &quot;Upload Documents&quot; to upload your documents
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
