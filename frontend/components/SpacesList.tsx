'use client';

import { useSpace } from '@/context/SpaceContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SpaceCard } from './space/SpaceCard';
import { LoadingSkeleton } from './ui/LoadingSkeleton';
import { Space } from '@/types';
import { UserProfile } from './UserProfile';

export function SpacesList() {
  const [isLoading, setIsLoading] = useState(true);
  const { spaces, getSpaces, setCurrentSpace, deleteSpace } = useSpace();
  const router = useRouter();

  const handleCreateNewSpace = () => {
    const uuid = crypto.randomUUID();
    router.push('/space/' + uuid);
  };

  const handleNavigateToSpace = (space: Space) => {
    setCurrentSpace({
      id: space.id,
      name: space.name,
      created_at: space.created_at
    });
    router.push('/space/' + space.id);
  };

  const handleDeleteSpace = async (spaceId: string) => {
    await deleteSpace(spaceId);
  };

  useEffect(() => {
    getSpaces().finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-end mb-4">
          <UserProfile />
        </div>
        <div className="text-left mb-12 mt-12">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-5xl flex items-center gap-4 font-normal text-foreground font-serif">
              Welcome to <span className="text-foreground">PaperTalk</span>
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl font-sans">
            Your AI-powered assistant for reading and understanding documents. Create a new space to get started!
          </p>
        </div>

        <div className="space-y-8">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-3xl font-normal text-foreground font-serif">My Spaces</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <button
              onClick={handleCreateNewSpace}
              className="bg-card rounded-2xl p-6 border border-border/50 hover:border-primary/50 transition-all duration-300 flex flex-col items-center justify-center h-48 group hover:shadow-lg hover:scale-[1.02] gap-3"
            >
              <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              <span className="text-foreground font-medium font-sans text-center">Create New Space</span>
            </button>

            {isLoading ? (
              <LoadingSkeleton count={3} />
            ) : (
              spaces && spaces.map((space) => (
                <SpaceCard
                  key={space.id}
                  space={space}
                  onClick={() => handleNavigateToSpace(space)}
                  onDelete={handleDeleteSpace}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
