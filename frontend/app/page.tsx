'use client';

import { useState, useEffect } from 'react';
import { SpacesList } from './components/SpacesList';

export default function Home() {
  const [currentSpace, setCurrentSpace] = useState<string | null>(null);
  const [spaces, setSpaces] = useState<string[]>([]);

  useEffect(() => {
    const savedSpaces = localStorage.getItem('spaces');
    if (savedSpaces) {
      setSpaces(JSON.parse(savedSpaces));
    }
  }, []);

  const createSpace = (spaceName: string) => {
    if (!spaceName.trim() || spaces.includes(spaceName)) return;
    const updatedSpaces = [...spaces, spaceName];
    setSpaces(updatedSpaces);
    localStorage.setItem('spaces', JSON.stringify(updatedSpaces));
    setCurrentSpace(spaceName);
  };

  const selectSpace = (spaceName: string) => {
    setCurrentSpace(spaceName);
  };

  return (
    <SpacesList
      spaces={spaces}
      onCreateSpace={createSpace}
      onSelectSpace={selectSpace}
    />
  );
}
