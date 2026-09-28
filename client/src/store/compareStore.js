import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useCompareStore = create(
  persist(
    (set, get) => ({
      comparedProducts: [],
      isOpen: false,

      addProduct: (product) => {
        if (!product) return;
        const current = get().comparedProducts;
        const id = product._id || product.id;
        if (current.some((p) => (p._id || p.id) === id)) {
          set({ isOpen: true });
          return;
        }
        if (current.length >= 4) {
          alert('Chỉ có thể so sánh tối đa 4 sản phẩm cùng lúc.');
          return;
        }
        set({
          comparedProducts: [...current, product],
          isOpen: true,
        });
      },

      removeProduct: (productId) => {
        const next = get().comparedProducts.filter(
          (p) => (p._id || p.id) !== productId
        );
        set({
          comparedProducts: next,
          isOpen: next.length > 0,
        });
      },

      clearAll: () => {
        set({ comparedProducts: [], isOpen: false });
      },

      setIsOpen: (isOpen) => set({ isOpen }),

      toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),

      isCompared: (productId) => {
        return get().comparedProducts.some((p) => (p._id || p.id) === productId);
      },
    }),
    {
      name: 'client-compare-store',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') return localStorage;
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      partialize: (state) => ({ comparedProducts: state.comparedProducts }),
    }
  )
);

export default useCompareStore;
