'use client';

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
  const handleCreateNewSpace = () => {
    onCreateSpace('Untitled Space');
  };

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 mt-12">
          <h1 className="text-5xl font-normal text-white mb-2">
            Welcome to <span className="text-white">PaperTalk</span>
          </h1>
        </div>

        {/* Spaces Section */}
        <div className="space-y-8">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-normal text-white">My Spaces</h2>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Create New Card - Always First */}
            <button
              onClick={handleCreateNewSpace}
              className="bg-zinc-900 rounded-2xl p-6 shadow-sm border border-zinc-800 hover:border-zinc-700 transition-all duration-200 flex flex-col items-center justify-center h-48 group"
            >
              <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="text-zinc-300 font-medium">Create New Space</span>
            </button>

            {/* Existing Spaces */}
            {spaces.map((space, index) => (
              <button
                key={space}
                onClick={() => onSelectSpace(space)}
                className={`${
                  cardColors[index % cardColors.length]
                } rounded-2xl p-6 shadow-sm border border-zinc-800 hover:border-zinc-700 transition-all duration-200 text-left flex flex-col justify-between h-48 group relative overflow-hidden`}
              >
                <div className="flex-1">
                  <div className="text-3xl mb-3">📄</div>
                  <h3 className="text-lg font-medium text-white line-clamp-2">{space}</h3>
                </div>
                <div className="text-sm text-zinc-400 mt-2">
                  {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
                <div className="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-4 h-4 text-zinc-300" fill="currentColor" viewBox="0 0 16 16">
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
