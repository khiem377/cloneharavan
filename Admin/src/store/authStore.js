import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Tạo browser UUID một lần duy nhất, dùng làm sessionId cho guest tracking
const generateAnonymousId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback nếu crypto.randomUUID không có
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
};

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      // isServerVerified: Cờ xác thực từ máy chủ Backend trong phiên RAM hiện tại.
      // Tuyệt đối KHÔNG lưu trong localStorage (Zero-Trust Client Storage) để chống giả mạo localStorage.setItem.
      isServerVerified: false,

      // anonymousId: browser UUID dùng làm sessionId cho guest tracking
      anonymousId: generateAnonymousId(),

      setAuth: ({ user, accessToken, refreshToken }) =>
        set({
          user,
          accessToken,
          refreshToken,
          isServerVerified: Boolean(accessToken && user && user.role !== 'user'),
        }),

      markServerVerified: (freshUser) =>
        set({
          user: freshUser,
          isServerVerified: Boolean(freshUser && freshUser.role !== 'user'),
        }),

      setUser: (user) => set({ user }),

      updateUser: (partial) =>
        set((state) => ({ user: state.user ? { ...state.user, ...partial } : partial })),

      setAccessToken: (accessToken) => set({ accessToken }),

      clearAuth: () => {
        try {
          localStorage.removeItem('admin-auth');
          localStorage.removeItem('admin');
          sessionStorage.removeItem('admin-auth');
        } catch {}
        set({ user: null, accessToken: null, refreshToken: null, isServerVerified: false });
      },

      // Lấy anonymousId hiện tại, tạo mới nếu chưa có
      getOrCreateAnonymousId: () => {
        const current = get().anonymousId;
        if (current) return current;
        const newId = generateAnonymousId();
        set({ anonymousId: newId });
        return newId;
      },

      isAuthenticated: () => Boolean(get().accessToken && get().isServerVerified),

      hasPermission: (permCode) => {
        const state = get();
        const user = state.user;
        // Bắt buộc phải có user, đã xác thực bởi server, và tuyệt đối không phải khách hàng thường
        if (!user || !state.isServerVerified || user.role === 'user') return false;
        if (user.role === 'administrator' || user.role === 'admin' || user.permissions?.includes('*')) {
          return true;
        }
        return Array.isArray(user.permissions) && user.permissions.includes(permCode);
      },

      hasAnyPermission: (permCodes = []) => {
        const state = get();
        const user = state.user;
        if (!user || !state.isServerVerified || user.role === 'user') return false;
        if (user.role === 'administrator' || user.role === 'admin' || user.permissions?.includes('*')) {
          return true;
        }
        if (!Array.isArray(user.permissions)) return false;
        return permCodes.some((code) => user.permissions.includes(code));
      },
    }),
    {
      name: 'admin-auth',
      partialize: (state) => ({
        user:         state.user,
        accessToken:  state.accessToken,
        refreshToken: state.refreshToken,
        anonymousId:  state.anonymousId, // persist anonymousId qua reload
        // Tuyệt đối KHÔNG persist isServerVerified -> Buộc ProtectedRoute phải verify với server
      }),
    }
  )
);


export default useAuthStore;

