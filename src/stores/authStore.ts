import { create } from "zustand";
import { persist, subscribeWithSelector } from "zustand/middleware";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  lastLoginAt: number | null;
  loginAttempts: number;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  clearError: () => void;
  refreshToken: () => Promise<void>;
}

// Token refresh interval (15 minutes)
const TOKEN_REFRESH_INTERVAL = 15 * 60 * 1000;

export const useAuthStore = create<AuthState>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        lastLoginAt: null,
        loginAttempts: 0,

        login: async (email: string, password: string) => {
          const state = get();
          
          // Rate limiting: max 5 attempts
          if (state.loginAttempts >= 5) {
            set({ error: 'Quá nhiều lần thử. Vui lòng đợi 5 phút.' });
            throw new Error('Too many login attempts');
          }

          set({ isLoading: true, error: null });

          try {
            // This will call the MirageJS mock API
            const response = await fetch("/api/auth/login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
              throw new Error("Invalid credentials");
            }

            const data = await response.json();
            
            set({
              user: data.user,
              token: data.token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
              lastLoginAt: Date.now(),
              loginAttempts: 0,
            });

            // Setup automatic token refresh
            setupTokenRefresh();
          } catch (error) {
            set((state) => ({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Đăng nhập thất bại',
              loginAttempts: state.loginAttempts + 1,
            }));
            throw error;
          }
        },

        logout: () => {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            lastLoginAt: null,
            loginAttempts: 0,
          });
          
          // Clear any pending token refresh
          clearTokenRefresh();
        },

        setUser: (user: User) => {
          set({ user });
        },

        clearError: () => {
          set({ error: null });
        },

        refreshToken: async () => {
          const state = get();
          if (!state.token) return;

          try {
            const response = await fetch("/api/auth/refresh", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${state.token}`,
              },
            });

            if (response.ok) {
              const data = await response.json();
              set({ token: data.token });
            } else {
              // Token expired, logout
              get().logout();
            }
          } catch (error) {
            console.error('Token refresh failed:', error);
          }
        },
      }),
      {
        name: "auth-storage",
        partialize: (state) => ({
          user: state.user,
          token: state.token,
          isAuthenticated: state.isAuthenticated,
          lastLoginAt: state.lastLoginAt,
        }),
        // Version for migrations
        version: 1,
      }
    )
  )
);

// Token refresh management
let tokenRefreshInterval: ReturnType<typeof setInterval> | null = null;

function setupTokenRefresh() {
  clearTokenRefresh();
  tokenRefreshInterval = setInterval(() => {
    useAuthStore.getState().refreshToken();
  }, TOKEN_REFRESH_INTERVAL);
}

function clearTokenRefresh() {
  if (tokenRefreshInterval) {
    clearInterval(tokenRefreshInterval);
    tokenRefreshInterval = null;
  }
}

// Subscribe to auth state changes for analytics
useAuthStore.subscribe(
  (state) => state.isAuthenticated,
  (isAuthenticated) => {
    if (isAuthenticated) {
      console.log('User logged in:', useAuthStore.getState().user?.name);
    } else {
      console.log('User logged out');
    }
  }
);
