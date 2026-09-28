'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import useAuthStore from '../store/authStore';

const StoreContext = createContext(null);

export const StoreProvider = ({
  children,
  initialMenu = null,
  initialCategories = [],
  initialTrending = [],
}) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  const [menuData, setMenuData] = useState(initialMenu);
  const [categories, setCategories] = useState(initialCategories);
  const [trendingKeywords, setTrendingKeywords] = useState(initialTrending);

  useEffect(() => {
    const { getOrCreateAnonymousId } = useAuthStore.getState();
    getOrCreateAnonymousId();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <StoreContext.Provider
        value={{
          menuData,
          setMenuData,
          categories,
          setCategories,
          trendingKeywords,
          setTrendingKeywords,
        }}
      >
        {children}
      </StoreContext.Provider>
    </QueryClientProvider>
  );
};

export const useStoreData = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStoreData must be used within a StoreProvider');
  }
  return context;
};

export default StoreProvider;
