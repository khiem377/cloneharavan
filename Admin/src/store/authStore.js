import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,

      setAuth: ({ user, accessToken, refreshToken }) =>
        set({ user, accessToken, refreshToken }),

      setAccessToken: (accessToken) => set({ accessToken }),

      clearAuth: () => set({ user: null, accessToken: null, refreshToken: null }),

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
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);

export default useAuthStore;
