import { create } from 'zustand';

export const useQuickViewStore = create((set) => ({
  isOpen: false,
  product: null,

  openQuickView: (product) => set({ isOpen: true, product }),
  closeQuickView: () => set({ isOpen: false, product: null }),
}));

export default useQuickViewStore;
