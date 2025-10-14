'use client';

import { Source } from '@/types';

interface CitationCardProps {
  filename: string;
  sources: Source[];
  index: number;
  relevanceScore: number;
  onViewFullText: () => void;
}

export function CitationCard({ filename, sources, index, relevanceScore, onViewFullText }: CitationCardProps) {
  // Combine all chunk texts
  const combinedText = sources.map(s => s.chunk_text).join(' ... ');

  // Get preview text (first few sentences)
  const getPreviewText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    const truncated = text.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    return truncated.substring(0, lastSpace) + '...';
  };

  const previewText = getPreviewText(combinedText);

  return (
    <div className="bg-muted/50 border border-border rounded-lg p-2 hover:bg-muted/80 transition-colors flex-shrink-0 w-48 cursor-pointer" onClick={onViewFullText}>
      <div className="flex items-start gap-1.5">
        <div className="flex-shrink-0">
          <span className="inline-flex items-center justify-center w-5 h-5 bg-primary text-primary-foreground rounded-full text-[10px] font-semibold">
            {index}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 mb-1">
            <h4 className="text-xs font-semibold text-foreground truncate flex-1">
              {filename}
            </h4>
            {sources.length > 1 && (
              <span className="text-[9px] text-muted-foreground bg-muted px-1 rounded flex-shrink-0">
                {sources.length}x
              </span>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground leading-snug line-clamp-2">
            {previewText}
          </p>
        </div>
      </div>
    </div>
  );
}
