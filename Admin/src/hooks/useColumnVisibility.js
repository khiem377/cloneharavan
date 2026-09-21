import { useState, useEffect, useCallback } from 'react';

/**
 * Custom React Hook for Managing Table Column Visibility with LocalStorage Persistence
 *
 * @param {string} storageKey - LocalStorage key (e.g. 'admin_products_columns')
 * @param {Array<{id: string, label: string, defaultVisible?: boolean, alwaysVisible?: boolean}>} defaultColumns
 */
export function useColumnVisibility(storageKey, defaultColumns = []) {
  const getDefaultKeys = useCallback(() => {
    return defaultColumns
      .filter((col) => col.defaultVisible !== false || col.alwaysVisible)
      .map((col) => col.id);
  }, [defaultColumns]);

  const [visibleKeys, setVisibleKeys] = useState(() => {
    if (!storageKey) return getDefaultKeys();
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Always ensure 'alwaysVisible' columns are present
          const alwaysVisibleKeys = defaultColumns
            .filter((col) => col.alwaysVisible)
            .map((col) => col.id);
          const combined = Array.from(new Set([...parsed, ...alwaysVisibleKeys]));
          return combined;
        }
      }
    } catch (e) {
      console.warn(`[useColumnVisibility] Error reading localStorage key "${storageKey}":`, e);
    }
    return getDefaultKeys();
  });

  // Sync to localStorage whenever visibleKeys change
  useEffect(() => {
    if (!storageKey) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(visibleKeys));
    } catch (e) {
      console.warn(`[useColumnVisibility] Error saving localStorage key "${storageKey}":`, e);
    }
  }, [storageKey, visibleKeys]);

  const isColumnVisible = useCallback(
    (colId) => {
      const col = defaultColumns.find((c) => c.id === colId);
      if (col?.alwaysVisible) return true;
      return visibleKeys.includes(colId);
    },
    [defaultColumns, visibleKeys]
  );

  const toggleColumn = useCallback(
    (colId) => {
      const col = defaultColumns.find((c) => c.id === colId);
      if (col?.alwaysVisible) return; // Ignore alwaysVisible columns

      setVisibleKeys((prev) => {
        if (prev.includes(colId)) {
          // Prevent hiding all columns - keep at least 1 column visible
          if (prev.length <= 1) return prev;
          return prev.filter((id) => id !== colId);
        } else {
          return [...prev, colId];
        }
      });
    },
    [defaultColumns]
  );

  const showAllColumns = useCallback(() => {
    const allKeys = defaultColumns.map((col) => col.id);
    setVisibleKeys(allKeys);
  }, [defaultColumns]);

  const resetColumns = useCallback(() => {
    const defaultKeys = getDefaultKeys();
    setVisibleKeys(defaultKeys);
  }, [getDefaultKeys]);

  return {
    columns: defaultColumns,
    visibleKeys,
    isColumnVisible,
    toggleColumn,
    showAllColumns,
    resetColumns,
    visibleCount: visibleKeys.length,
    totalCount: defaultColumns.length,
  };
}

export default useColumnVisibility;
