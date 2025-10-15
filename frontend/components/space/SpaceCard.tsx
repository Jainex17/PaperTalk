'use client';

import { Space } from '@/types';
import { formatDate } from '@/lib/utils';

interface SpaceCardProps {
  space: Space;
  onClick: () => void;
}

export function SpaceCard({ space, onClick }: SpaceCardProps) {
  return (
    <button
      onClick={onClick}
      className={`bg-card rounded-2xl p-6 cursor-pointer border border-border transition-all duration-200 text-left flex flex-col justify-between h-48`}
    >
      <div className="flex-1">
        <div className="text-3xl mb-3">📄</div>
        <h3 className="text-lg font-medium text-foreground line-clamp-2 font-serif">{space.name}</h3>
      </div>
      <div className="text-sm text-muted-foreground mt-2 font-sans">
        {formatDate(space.created_at)}
      </div>
    </button>
  );
}
