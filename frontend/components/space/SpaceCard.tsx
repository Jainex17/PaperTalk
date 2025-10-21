'use client';

import { Space } from '@/types';
import { formatDate } from '@/lib/utils';
import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface SpaceCardProps {
  space: Space;
  onClick: () => void;
  onDelete: (spaceId: string) => void;
}

export function SpaceCard({ space, onClick, onDelete }: SpaceCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when clicking delete
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(space.id);
    } catch (error) {
      console.error('Failed to delete space:', error);
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="relative bg-card rounded-2xl p-6 border border-border transition-all duration-200 text-left flex flex-col justify-between h-48 group">
        <button
          onClick={onClick}
          disabled={isDeleting}
          className="absolute inset-0 cursor-pointer"
        >
          <span className="sr-only">Open {space.name}</span>
        </button>

        <div className="flex-1 pointer-events-none">
          <div className="text-3xl mb-3">📄</div>
          <h3 className="text-lg font-medium text-foreground line-clamp-2 font-serif">{space.name}</h3>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="text-sm text-muted-foreground font-sans">
            {formatDate(space.created_at)}
          </div>
          <button
            onClick={handleDeleteClick}
            disabled={isDeleting}
            className="relative z-10 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-destructive/10 rounded-lg"
            title="Delete space"
          >
            <Trash2 className="w-4 h-4 text-destructive" />
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete space?"
        message={`Are you sure you want to delete "${space.name}"? This will permanently remove the space and all its documents. This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
}
