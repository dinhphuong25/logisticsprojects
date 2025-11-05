import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
}

interface UIState {
  // Sidebar
  sidebarCollapsed: boolean;
  sidebarPinned: boolean;
  
  // Notifications
  notifications: Notification[];
  unreadCount: number;
  
  // Modals
  activeModal: string | null;
  modalData: Record<string, unknown> | null;
  
  // Search
  globalSearchQuery: string;
  searchHistory: string[];
  
  // Loading states
  loadingStates: Record<string, boolean>;
  
  // Actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebarPin: () => void;
  
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  
  openModal: (modalId: string, data?: Record<string, unknown>) => void;
  closeModal: () => void;
  
  setGlobalSearch: (query: string) => void;
  addToSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;
  
  setLoading: (key: string, loading: boolean) => void;
  isLoading: (key: string) => boolean;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Initial state
      sidebarCollapsed: typeof window !== 'undefined' && window.innerWidth < 1024, // Collapsed on mobile by default
      sidebarPinned: true,
      notifications: [],
      unreadCount: 0,
      activeModal: null,
      modalData: null,
      globalSearchQuery: '',
      searchHistory: [],
      loadingStates: {},

      // Sidebar actions
      toggleSidebar: () => {
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
      },

      setSidebarCollapsed: (collapsed: boolean) => {
        set({ sidebarCollapsed: collapsed });
      },

      toggleSidebarPin: () => {
        set((state) => ({ sidebarPinned: !state.sidebarPinned }));
      },

      // Notification actions
      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: `notif-${Date.now()}-${Math.random()}`,
          timestamp: Date.now(),
          read: false,
        };

        set((state) => ({
          notifications: [newNotification, ...state.notifications].slice(0, 50), // Keep max 50
          unreadCount: state.unreadCount + 1,
        }));
      },

      markNotificationAsRead: (id: string) => {
        set((state) => {
          const notification = state.notifications.find((n) => n.id === id);
          if (!notification || notification.read) return state;

          return {
            notifications: state.notifications.map((n) =>
              n.id === id ? { ...n, read: true } : n
            ),
            unreadCount: Math.max(0, state.unreadCount - 1),
          };
        });
      },

      markAllNotificationsAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        }));
      },

      removeNotification: (id: string) => {
        set((state) => {
          const notification = state.notifications.find((n) => n.id === id);
          return {
            notifications: state.notifications.filter((n) => n.id !== id),
            unreadCount: notification && !notification.read 
              ? Math.max(0, state.unreadCount - 1)
              : state.unreadCount,
          };
        });
      },

      clearAllNotifications: () => {
        set({ notifications: [], unreadCount: 0 });
      },

      // Modal actions
      openModal: (modalId: string, data?: Record<string, unknown>) => {
        set({ activeModal: modalId, modalData: data || null });
      },

      closeModal: () => {
        set({ activeModal: null, modalData: null });
      },

      // Search actions
      setGlobalSearch: (query: string) => {
        set({ globalSearchQuery: query });
      },

      addToSearchHistory: (query: string) => {
        if (!query.trim()) return;

        set((state) => {
          const filtered = state.searchHistory.filter((q) => q !== query);
          return {
            searchHistory: [query, ...filtered].slice(0, 10), // Keep max 10
          };
        });
      },

      clearSearchHistory: () => {
        set({ searchHistory: [] });
      },

      // Loading actions
      setLoading: (key: string, loading: boolean) => {
        set((state) => ({
          loadingStates: {
            ...state.loadingStates,
            [key]: loading,
          },
        }));
      },

      isLoading: (key: string) => {
        return get().loadingStates[key] || false;
      },
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        sidebarPinned: state.sidebarPinned,
        searchHistory: state.searchHistory,
        // Don't persist notifications, modals, or loading states
      }),
      version: 1,
    }
  )
);

// Cleanup old notifications (7 days)
const NOTIFICATION_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

setInterval(() => {
  const state = useUIStore.getState();
  const now = Date.now();
  const validNotifications = state.notifications.filter(
    (n) => now - n.timestamp < NOTIFICATION_MAX_AGE
  );

  if (validNotifications.length !== state.notifications.length) {
    useUIStore.setState({
      notifications: validNotifications,
      unreadCount: validNotifications.filter((n) => !n.read).length,
    });
  }
}, 60 * 60 * 1000); // Check every hour
