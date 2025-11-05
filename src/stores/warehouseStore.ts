import { create } from "zustand";
import { persist, devtools, subscribeWithSelector } from "zustand/middleware";
import type { Warehouse } from "@/types";

interface WarehouseState {
  currentWarehouse: Warehouse | null;
  warehouses: Warehouse[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
  favorites: string[]; // Warehouse IDs
  recentlyViewed: string[]; // Warehouse IDs, max 5
  
  // Actions
  setCurrentWarehouse: (warehouse: Warehouse) => void;
  setWarehouses: (warehouses: Warehouse[]) => void;
  addWarehouse: (warehouse: Warehouse) => void;
  updateWarehouse: (id: string, updates: Partial<Warehouse>) => void;
  removeWarehouse: (id: string) => void;
  toggleFavorite: (id: string) => void;
  addToRecentlyViewed: (id: string) => void;
  clearError: () => void;
  refreshWarehouses: () => Promise<void>;
  
  // Selectors (computed values)
  getFavoriteWarehouses: () => Warehouse[];
  getRecentlyViewedWarehouses: () => Warehouse[];
}

export const useWarehouseStore = create<WarehouseState>()(
  devtools(
    subscribeWithSelector(
      persist(
        (set, get) => ({
          currentWarehouse: null,
          warehouses: [],
          isLoading: false,
          error: null,
          lastUpdated: null,
          favorites: [],
          recentlyViewed: [],

          setCurrentWarehouse: (warehouse: Warehouse) => {
            set({ currentWarehouse: warehouse }, false, 'setCurrentWarehouse');
            get().addToRecentlyViewed(warehouse.id);
          },

          setWarehouses: (warehouses: Warehouse[]) => {
            set({ 
              warehouses,
              lastUpdated: Date.now(),
              error: null,
            }, false, 'setWarehouses');
            
            // Set first warehouse as default if none selected
            const state = get();
            if (!state.currentWarehouse && warehouses.length > 0) {
              set({ currentWarehouse: warehouses[0] });
            }
          },

          addWarehouse: (warehouse: Warehouse) => {
            set((state) => ({
              warehouses: [...state.warehouses, warehouse],
              lastUpdated: Date.now(),
            }), false, 'addWarehouse');
          },

          updateWarehouse: (id: string, updates: Partial<Warehouse>) => {
            set((state) => ({
              warehouses: state.warehouses.map((w) =>
                w.id === id ? { ...w, ...updates } : w
              ),
              currentWarehouse: 
                state.currentWarehouse?.id === id
                  ? { ...state.currentWarehouse, ...updates }
                  : state.currentWarehouse,
              lastUpdated: Date.now(),
            }), false, 'updateWarehouse');
          },

          removeWarehouse: (id: string) => {
            set((state) => ({
              warehouses: state.warehouses.filter((w) => w.id !== id),
              currentWarehouse:
                state.currentWarehouse?.id === id ? null : state.currentWarehouse,
              favorites: state.favorites.filter((fId) => fId !== id),
              recentlyViewed: state.recentlyViewed.filter((rId) => rId !== id),
              lastUpdated: Date.now(),
            }), false, 'removeWarehouse');
          },

          toggleFavorite: (id: string) => {
            set((state) => ({
              favorites: state.favorites.includes(id)
                ? state.favorites.filter((fId) => fId !== id)
                : [...state.favorites, id],
            }), false, 'toggleFavorite');
          },

          addToRecentlyViewed: (id: string) => {
            set((state) => {
              const filtered = state.recentlyViewed.filter((rId) => rId !== id);
              return {
                recentlyViewed: [id, ...filtered].slice(0, 5), // Keep max 5
              };
            }, false, 'addToRecentlyViewed');
          },

          clearError: () => {
            set({ error: null }, false, 'clearError');
          },

          refreshWarehouses: async () => {
            set({ isLoading: true, error: null }, false, 'refreshWarehouses/start');
            
            try {
              const response = await fetch('/api/warehouses');
              if (!response.ok) throw new Error('Failed to fetch warehouses');
              
              const data = await response.json();
              get().setWarehouses(data.warehouses);
              
              set({ isLoading: false }, false, 'refreshWarehouses/success');
            } catch (error) {
              set({
                isLoading: false,
                error: error instanceof Error ? error.message : 'Unknown error',
              }, false, 'refreshWarehouses/error');
            }
          },

          // Selectors
          getFavoriteWarehouses: () => {
            const state = get();
            return state.warehouses.filter((w) => state.favorites.includes(w.id));
          },

          getRecentlyViewedWarehouses: () => {
            const state = get();
            return state.recentlyViewed
              .map((id) => state.warehouses.find((w) => w.id === id))
              .filter(Boolean) as Warehouse[];
          },
        }),
        {
          name: "warehouse-storage",
          partialize: (state) => ({
            currentWarehouse: state.currentWarehouse,
            warehouses: state.warehouses,
            favorites: state.favorites,
            recentlyViewed: state.recentlyViewed,
            lastUpdated: state.lastUpdated,
          }),
          version: 1,
        }
      )
    ),
    { name: 'WarehouseStore' }
  )
);

// Auto-refresh warehouses every 5 minutes if data is stale
const AUTO_REFRESH_INTERVAL = 5 * 60 * 1000;

useWarehouseStore.subscribe(
  (state) => state.lastUpdated,
  (lastUpdated) => {
    if (lastUpdated) {
      const timeSinceUpdate = Date.now() - lastUpdated;
      if (timeSinceUpdate > AUTO_REFRESH_INTERVAL) {
        useWarehouseStore.getState().refreshWarehouses();
      }
    }
  }
);
