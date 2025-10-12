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
    if (!currentSpace) {
      return;
    }

    // If name is empty, cancel edit
    if (tempSpaceName.trim() === '') {
      cancelEdit();
      return;
    }

    // If name hasn't changed, just exit edit mode
    if (tempSpaceName.trim() === currentSpace.name.trim()) {
      setEditSpaceName(false);
      return;
    }

    // Store the previous name for rollback
    const previousName = currentSpace.name;
    const newName = tempSpaceName.trim();

    // Optimistically update the UI
    setCurrentSpace({ ...currentSpace, name: newName });
    setEditSpaceName(false);

    try {
      await updateSpaceNameAPI(currentSpace.id, newName);
      // Success - name is already updated
    } catch (error) {
      console.error('Error saving space name:', error);
      // Rollback to previous name on failure
      setCurrentSpace({ ...currentSpace, name: previousName });
      setTempSpaceName(previousName);
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
