'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface Space {
  id: string;
  name: string;
  created_at: string;
}

interface SpaceContextType {
  spaces: Space[];
  currentSpace: Space | null;
  setSpaces: (spaces: Space[]) => void;
  setCurrentSpace: (space: Space | null) => void;
  getSpaces: () => Promise<void>;
}

const SpaceContext = createContext<SpaceContextType | undefined>(undefined);

export function SpaceProvider({ children }: { children: ReactNode }) {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [currentSpace, setCurrentSpace] = useState<Space | null>(null);

  async function getSpaces() {
    try {
      const res = await fetch('http://localhost:8000/spaces', { cache: 'no-store' });
      const data = await res.json();
      setSpaces(data);
    } catch (error) {
      console.error('Error fetching spaces:', error);
    }
  }


  return (
    <SpaceContext.Provider
      value={{
        spaces,
        currentSpace,
        setSpaces,
        setCurrentSpace,
        getSpaces
      }}
    >
      {children}
    </SpaceContext.Provider>
  );
}

export function useSpace() {
  const context = useContext(SpaceContext);
  if (context === undefined) {
    throw new Error('useSpace must be used within a SpaceProvider');
  }
  return context;
}
