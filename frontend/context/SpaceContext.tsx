'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Space } from '@/types';
import { getSpaces as getSpacesAPI, deleteSpace as deleteSpaceAPI } from '@/lib/api/spaces';

interface SpaceContextType {
  spaces: Space[];
  currentSpace: Space | null;
  setSpaces: (spaces: Space[]) => void;
  setCurrentSpace: (space: Space | null) => void;
  getSpaces: () => Promise<void>;
  deleteSpace: (spaceId: string) => Promise<void>;
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

  async function deleteSpace(spaceId: string) {
    try {
      await deleteSpaceAPI(spaceId);
      // Update local state by removing the deleted space
      setSpaces(spaces.filter(space => space.id !== spaceId));
      // Clear current space if it was the deleted one
      if (currentSpace?.id === spaceId) {
        setCurrentSpace(null);
      }
    } catch (error) {
      console.error('Error deleting space:', error);
      throw error;
    }
  }

  return (
    <SpaceContext.Provider
      value={{
        spaces,
        currentSpace,
        setSpaces,
        setCurrentSpace,
        getSpaces,
        deleteSpace
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
