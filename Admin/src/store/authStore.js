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
      // anonymousId: browser UUID dùng làm sessionId cho guest tracking
      // Được tạo 1 lần và giữ nguyên suốt vòng đời của browser session
      anonymousId: generateAnonymousId(),

      setAuth: ({ user, accessToken, refreshToken }) =>
        set({ user, accessToken, refreshToken }),

      setAccessToken: (accessToken) => set({ accessToken }),

      clearAuth: () =>
        set({ user: null, accessToken: null, refreshToken: null }),
        // Giữ lại anonymousId khi logout để tiếp tục track nếu user quay lại

      // Lấy anonymousId hiện tại, tạo mới nếu chưa có
      getOrCreateAnonymousId: () => {
        const current = get().anonymousId;
        if (current) return current;
        const newId = generateAnonymousId();
        set({ anonymousId: newId });
        return newId;
      },

      isAuthenticated: () => !!get().accessToken,

      hasPermission: (permCode) => {
        const user = get().user;
        if (!user) return false;
        if (user.role === 'administrator' || user.role === 'admin' || user.permissions?.includes('*')) {
          return true;
        }
        return Array.isArray(user.permissions) && user.permissions.includes(permCode);
      },

      hasAnyPermission: (permCodes = []) => {
        const user = get().user;
        if (!user) return false;
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
      }),
    }
  )
);

export default useAuthStore;

