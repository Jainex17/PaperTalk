'use client';

import { useSpace } from '@/context/SpaceContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import logo from '@/assets/logo.png';

const cardColors = [
  'bg-gradient-to-br from-amber-100/50 to-amber-200/40',
  'bg-gradient-to-br from-orange-100/50 to-orange-200/40',
  'bg-gradient-to-br from-yellow-100/50 to-yellow-200/40',
  'bg-gradient-to-br from-stone-100/50 to-stone-200/40',
  'bg-gradient-to-br from-neutral-100/50 to-neutral-200/40',
  'bg-gradient-to-br from-zinc-100/50 to-zinc-200/40',
  'bg-gradient-to-br from-slate-100/50 to-slate-200/40',
  'bg-gradient-to-br from-gray-100/50 to-gray-200/40',
];

export function SpacesList() {
  const [isLoading, setIsLoading] = useState(true);
  const { spaces, getSpaces, setCurrentSpace } = useSpace();

  const router = useRouter();
  const handleCreateNewSpace = () => {
    const uuid = crypto.randomUUID();
    router.push('/space/' + uuid);
  };
  const handleNavigateToSpace = (space: any) => {
    setCurrentSpace({
      id: space.id,
      name: space.name,
      created_at: space.created_at
    });
    router.push('/space/' + space.id);
  }

  useEffect(() => {
    getSpaces().finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-left mb-12 mt-12">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-5xl flex items-center gap-4 font-normal text-foreground font-serif">
              Welcome to <span className="text-foreground">PaperTalk</span>
              <Image src={logo} alt="PaperTalk" width={48} height={48} className="object-contain pb-2" />
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

            {isLoading ? (
              <>
                {[...Array(3)].map((_, idx) => (
                  <div
                    key={idx}
                    className="bg-card rounded-2xl p-6 border border-border h-48 animate-pulse"
                    style={{ boxShadow: 'var(--shadow-sm)' }}
                  >
                    <div className="w-8 h-8 bg-secondary rounded-md mb-3"></div>
                    <div className="h-4 bg-secondary rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-secondary rounded w-1/2"></div>
                    <div className="mt-auto pt-8">
                      <div className="h-3 bg-secondary rounded w-1/3"></div>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              spaces && spaces.map((space, idx) => (
                <button
                  key={idx}
                  onClick={() => handleNavigateToSpace(space)}
                  className={`${
                    cardColors[Math.floor(Math.random() * cardColors.length-1)]
                  } rounded-2xl p-6 cursor-pointer border border-border hover:border-primary transition-all duration-200 text-left flex flex-col justify-between h-48 group relative overflow-hidden`}
                  style={{ boxShadow: 'var(--shadow-sm)' }}
                >
                  <div className="flex-1">
                    <div className="text-3xl mb-3">📄</div>
                    <h3 className="text-lg font-medium text-foreground line-clamp-2 font-serif">{space.name}</h3>
                  </div>
                  <div className="text-sm text-muted-foreground mt-2 font-sans">
                    {new Date(space.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
