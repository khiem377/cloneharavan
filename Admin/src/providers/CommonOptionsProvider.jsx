import React, { createContext, useContext } from 'react';
import { useAllProductsSelect } from '@/hooks/useProducts';
import { useAllCategoriesSelect } from '@/hooks/useCategories';
import { useAllBrands } from '@/hooks/useBrands';

const CommonOptionsContext = createContext(null);

/**
 * CommonOptionsProvider - Centralized Options Caching Provider
 * Giúp tất cả Form/Modal trong Admin lấy danh sách Options (Sản phẩm, Danh mục, Thương hiệu)
 * thông qua TanStack Query Cache với staleTime 5-10 phút, không gọi API lặp lại.
 */
export function CommonOptionsProvider({ children }) {
  const { data: productsOptions = [], isLoading: loadingProducts } = useAllProductsSelect();
  const { data: categoriesOptions = [], isLoading: loadingCategories } = useAllCategoriesSelect(false);
  const { data: brandsOptions = [], isLoading: loadingBrands } = useAllBrands();

  const value = {
    productsOptions,
    categoriesOptions,
    brandsOptions,
    loadingProducts,
    loadingCategories,
    loadingBrands,
  };

  return (
    <CommonOptionsContext.Provider value={value}>
      {children}
    </CommonOptionsContext.Provider>
  );
}

export function useCommonOptions() {
  const context = useContext(CommonOptionsContext);
  if (!context) {
    throw new Error('useCommonOptions must be used within a CommonOptionsProvider');
  }
  return context;
}
