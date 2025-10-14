'use client';

import { Source } from '@/types';
import { X } from 'lucide-react';

interface CitationModalProps {
  filename: string;
  sources: Source[];
  isOpen: boolean;
  onClose: () => void;
  citationNumber: number;
}

export function CitationModal({ filename, sources, isOpen, onClose, citationNumber }: CitationModalProps) {
  if (!isOpen || !sources || sources.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-background border border-border rounded-lg shadow-lg w-[90vw] max-w-2xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-semibold">
              {citationNumber}
            </span>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {filename}
              </h2>
              {sources.length > 1 && (
                <p className="text-xs text-muted-foreground">
                  {sources.length} sections from this document
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="prose prose-sm max-w-none space-y-4">
            {sources.map((source, index) => (
              <div key={`${source.doc_id}-${index}`} className="border-b border-border last:border-b-0 pb-4 last:pb-0">
                {sources.length > 1 && (
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-primary">
                      Section {index + 1} of {sources.length}
                    </span>
                  </div>
                )}
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {source.chunk_text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
