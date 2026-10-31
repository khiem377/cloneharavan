import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const generateAnonymousId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
};

export const syncAuthCookie = (user) => {
  if (typeof document === 'undefined') return;
  if (!user) {
    document.cookie = 'client_user=; path=/; max-age=0; SameSite=Lax';
    return;
  }
  try {
    const payload = {
      _id: user._id || user.id,
      fullName: user.fullName || user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      avatar: user.avatar || null,
      role: user.role || 'customer',
    };
    const encoded = encodeURIComponent(JSON.stringify(payload));
    document.cookie = `client_user=${encoded}; path=/; max-age=2592000; SameSite=Lax`;
  } catch (_) {}
};

const getInitialState = () => {
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('client-auth');
      if (raw) {
        const parsed = JSON.parse(raw)?.state;
        if (parsed) {
          if (parsed.user) {
            syncAuthCookie(parsed.user);
          }
          const directId = localStorage.getItem('cart_anonymous_id') || parsed.anonymousId;
          if (directId && !localStorage.getItem('cart_anonymous_id')) {
            localStorage.setItem('cart_anonymous_id', directId);
          }
          return {
            user: parsed.user || null,
            accessToken: parsed.accessToken || null,
            refreshToken: parsed.refreshToken || null,
            anonymousId: directId || null,
          };
        }
      }
      const directId = localStorage.getItem('cart_anonymous_id');
      if (directId) {
        return {
          user: null,
          accessToken: null,
          refreshToken: null,
          anonymousId: directId,
        };
      }
    } catch (e) {
      console.error('Error reading auth state from localStorage:', e);
    }
  }
  return {
    user: null,
    accessToken: null,
    refreshToken: null,
    anonymousId: null,
  };
};

const initial = getInitialState();

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: initial.user,
      accessToken: initial.accessToken,
      refreshToken: initial.refreshToken,
      anonymousId: initial.anonymousId,

      setAuth: ({ user, accessToken, refreshToken }) => {
        syncAuthCookie(user);
        set({ user, accessToken, refreshToken });
      },

      setUser: (user) => {
        syncAuthCookie(user);
        set({ user });
      },

      setAccessToken: (accessToken) => set({ accessToken }),

      clearAuth: () => {
        syncAuthCookie(null);
        set({ user: null, accessToken: null, refreshToken: null });
      },

      getOrCreateAnonymousId: () => {
        const current = get().anonymousId;
        if (current) return current;

        if (typeof window !== 'undefined') {
          try {
            const stored = localStorage.getItem('cart_anonymous_id');
            if (stored) {
              set({ anonymousId: stored });
              return stored;
            }
            const raw = localStorage.getItem('client-auth');
            if (raw) {
              const parsed = JSON.parse(raw)?.state;
              if (parsed?.anonymousId) {
                localStorage.setItem('cart_anonymous_id', parsed.anonymousId);
                set({ anonymousId: parsed.anonymousId });
                return parsed.anonymousId;
              }
            }
          } catch {}
        }

        const newId = generateAnonymousId();
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('cart_anonymous_id', newId);
          } catch {}
        }
        set({ anonymousId: newId });
        return newId;
      },

      isAuthenticated: () => !!get().accessToken,
    }),
    {
      name: 'client-auth',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') {
          return localStorage;
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        anonymousId: state.anonymousId,
      }),
    }
  )
);

export default useAuthStore;
