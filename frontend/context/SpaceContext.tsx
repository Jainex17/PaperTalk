'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface Space {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
}

interface SpaceContextType {
  spaces: Space[];
  currentSpace: Space | null;
  setSpaces: (spaces: Space[]) => void;
  setCurrentSpace: (space: Space | null) => void;
  addSpace: (space: Space) => void;
  removeSpace: (spaceId: string) => void;
  updateSpace: (spaceId: string, updates: Partial<Space>) => void;
}

const SpaceContext = createContext<SpaceContextType | undefined>(undefined);

export function SpaceProvider({ children }: { children: ReactNode }) {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [currentSpace, setCurrentSpace] = useState<Space | null>(null);

  const addSpace = useCallback((space: Space) => {
    setSpaces((prev) => [...prev, space]);
  }, []);

  const removeSpace = useCallback((spaceId: string) => {
    setSpaces((prev) => prev.filter((s) => s.id !== spaceId));
    setCurrentSpace((current) => (current?.id === spaceId ? null : current));
  }, []);

  const updateSpace = useCallback((spaceId: string, updates: Partial<Space>) => {
    setSpaces((prev) =>
      prev.map((s) => (s.id === spaceId ? { ...s, ...updates } : s))
    );
    setCurrentSpace((current) =>
      current?.id === spaceId ? { ...current, ...updates } : current
    );
  }, []);

  return (
    <SpaceContext.Provider
      value={{
        spaces,
        currentSpace,
        setSpaces,
        setCurrentSpace,
        addSpace,
        removeSpace,
        updateSpace,
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
