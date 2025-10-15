'use client';

import { ArrowLeft, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useSpace } from '@/context/SpaceContext';
import { useSpaceName } from '@/hooks/useSpaceName';

interface SpaceHeaderProps {
  documentsCount: number;
  onOpenDocuments: () => void;
  onClearChat?: () => void;
  showClearChat?: boolean;
  loadingDocuments?: boolean;
}

export function SpaceHeader({ documentsCount, onOpenDocuments, onClearChat, showClearChat = false, loadingDocuments = false }: SpaceHeaderProps) {
  const { currentSpace } = useSpace();
  const {
    editSpaceName,
    setEditSpaceName,
    tempSpaceName,
    setTempSpaceName,
    saveSpaceName,
    cancelEdit,
  } = useSpaceName();

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-3">
        <Link href="/spaces" className="p-2 hover:bg-muted rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="text-center">
          {editSpaceName ? (
            <input
              type="text"
              value={tempSpaceName}
              onChange={(e) => setTempSpaceName(e.target.value)}
              onBlur={() => {
                saveSpaceName();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  e.currentTarget.blur();
                } else if (e.key === 'Escape') {
                  e.preventDefault();
                  cancelEdit();
                }
              }}
              autoFocus
              className="text-xl font-semibold font-serif outline-none border-b-2 border-primary bg-transparent px-2 py-1"
            />
          ) : (
            <h1
              className="text-xl font-semibold font-serif cursor-pointer px-2 py-1 border-b-2 border-transparent hover:border-muted-foreground transition-all"
              onClick={() => setEditSpaceName(true)}
              title="Click to edit space name"
            >
              {currentSpace ? currentSpace.name : 'New Space'}
            </h1>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {showClearChat && onClearChat && (
          <button
            onClick={onClearChat}
            className="flex items-center gap-2 border border-border bg-secondary text-secondary-foreground py-2 px-5 rounded-xl hover:opacity-90 transition-all cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear chat</span>
          </button>
        )}
        <button
          onClick={onOpenDocuments}
          disabled={loadingDocuments}
          className="border border-border bg-secondary text-secondary-foreground py-2 px-5 rounded-xl hover:opacity-90 transition-all gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {loadingDocuments ? (
            <span>Fetching sources...</span>
          ) : (
            <span>{documentsCount > 0 ? `${documentsCount} source${documentsCount > 1 ? 's' : ''}` : 'Upload Sources'}</span>
          )}
        </button>
      </div>
    </div>
  );
}
