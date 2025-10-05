'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Space } from '@/types';
import { getSpaces as getSpacesAPI } from '@/lib/api/spaces';

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
      const data = await getSpacesAPI();
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
