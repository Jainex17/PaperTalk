import { useState, useEffect } from 'react';
import { useSpace } from '@/context/SpaceContext';
import { updateSpaceName as updateSpaceNameAPI } from '@/lib/api/spaces';

export const useSpaceName = () => {
  const { currentSpace, setCurrentSpace } = useSpace();
  const [editSpaceName, setEditSpaceName] = useState(false);
  const [tempSpaceName, setTempSpaceName] = useState('');

  useEffect(() => {
    if (currentSpace) {
      setTempSpaceName(currentSpace.name);
    }
  }, [currentSpace]);

  const saveSpaceName = async () => {
    if (tempSpaceName.trim() === '' || !currentSpace) {
      return;
    }

    try {
      await updateSpaceNameAPI(currentSpace.id, tempSpaceName);
      setCurrentSpace({ ...currentSpace, name: tempSpaceName });
      setEditSpaceName(false);
    } catch (error) {
      console.error('Error saving space name:', error);
    }
  };

  const cancelEdit = () => {
    setTempSpaceName(currentSpace?.name || 'New Space');
    setEditSpaceName(false);
  };

  return {
    editSpaceName,
    setEditSpaceName,
    tempSpaceName,
    setTempSpaceName,
    saveSpaceName,
    cancelEdit,
  };
};
