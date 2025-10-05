'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useSpace } from '@/context/SpaceContext';
import { useSpaceName } from '@/hooks/useSpaceName';

interface SpaceHeaderProps {
  documentsCount: number;
  onOpenDocuments: () => void;
}

export function SpaceHeader({ documentsCount, onOpenDocuments }: SpaceHeaderProps) {
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
        <Link href="/" className="p-2 hover:bg-muted rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="text-center">
          {editSpaceName ? (
            <input
              type="text"
              value={tempSpaceName}
              onChange={(e) => setTempSpaceName(e.target.value)}
              onBlur={saveSpaceName}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  saveSpaceName();
                } else if (e.key === 'Escape') {
                  cancelEdit();
                }
              }}
              autoFocus
              className="text-xl font-semibold font-serif outline-none border-b border-primary bg-transparent"
            />
          ) : (
            <h1 className="text-xl font-semibold font-serif" onClick={() => setEditSpaceName(true)}>
              {currentSpace ? currentSpace.name : 'New Space'}
            </h1>
          )}
        </div>
      </div>
      <button
        onClick={onOpenDocuments}
        className="border border-border bg-secondary text-secondary-foreground py-2 px-5 rounded-xl hover:opacity-90 transition-all gap-2 cursor-pointer"
      >
        <span>{documentsCount > 0 ? `${documentsCount} file${documentsCount > 1 ? 's' : ''}` : 'Upload Documents'}</span>
      </button>
    </div>
  );
}
