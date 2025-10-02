'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface SpacesListProps {
  spaces: string[];
  onCreateSpace: (name: string) => void;
  onSelectSpace: (name: string) => void;
}

const cardColors = [
  'bg-gradient-to-br from-red-200/40 to-red-300/30',
  'bg-gradient-to-br from-yellow-200/40 to-yellow-300/30',
  'bg-gradient-to-br from-orange-200/40 to-orange-300/30',
  'bg-gradient-to-br from-pink-200/40 to-pink-300/30',
  'bg-gradient-to-br from-purple-200/40 to-purple-300/30',
  'bg-gradient-to-br from-blue-200/40 to-blue-300/30',
  'bg-gradient-to-br from-green-200/40 to-green-300/30',
  'bg-gradient-to-br from-amber-200/40 to-amber-300/30',
];

export function SpacesList({ spaces, onCreateSpace, onSelectSpace }: SpacesListProps) {
  
  const router = useRouter();

  const handleCreateNewSpace = () => {
    const uuid = crypto.randomUUID();
    router.push('/space/' + uuid);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 mt-12">
          <h1 className="text-5xl font-normal text-foreground mb-2 font-serif">
            Welcome to <span className="text-foreground">PaperTalk</span>
          </h1>
        </div>

        {/* Spaces Section */}
        <div className="space-y-8">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-normal text-foreground font-serif">My Spaces</h2>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Create New Card - Always First */}
            <button
              onClick={handleCreateNewSpace}
              className="bg-card rounded-2xl p-6 border border-border hover:border-primary transition-all duration-200 flex flex-col items-center justify-center h-48 group"
              style={{ boxShadow: 'var(--shadow-sm)' }}
            >
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="text-card-foreground font-medium font-sans">Create New Space</span>
            </button>

            {/* Existing Spaces */}
            {spaces.map((space, index) => (
              <button
                key={space}
                onClick={() => onSelectSpace(space)}
                className={`${
                  cardColors[index % cardColors.length]
                } rounded-2xl p-6 border border-border hover:border-primary transition-all duration-200 text-left flex flex-col justify-between h-48 group relative overflow-hidden`}
                style={{ boxShadow: 'var(--shadow-sm)' }}
              >
                <div className="flex-1">
                  <div className="text-3xl mb-3">📄</div>
                  <h3 className="text-lg font-medium text-foreground line-clamp-2 font-serif">{space}</h3>
                </div>
                <div className="text-sm text-muted-foreground mt-2 font-sans">
                  {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
                <div className="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-4 h-4 text-muted-foreground" fill="currentColor" viewBox="0 0 16 16">
                    <circle cx="8" cy="3" r="1.5"/>
                    <circle cx="8" cy="8" r="1.5"/>
                    <circle cx="8" cy="13" r="1.5"/>
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
