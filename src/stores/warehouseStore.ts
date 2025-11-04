import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Warehouse } from "@/types";

interface WarehouseState {
  currentWarehouse: Warehouse | null;
  warehouses: Warehouse[];
  setCurrentWarehouse: (warehouse: Warehouse) => void;
  setWarehouses: (warehouses: Warehouse[]) => void;
}

export const useWarehouseStore = create<WarehouseState>()(
  persist(
    (set) => ({
      currentWarehouse: null,
      warehouses: [],

      setCurrentWarehouse: (warehouse: Warehouse) => {
        set({ currentWarehouse: warehouse });
      },

      setWarehouses: (warehouses: Warehouse[]) => {
        set({ warehouses });
        // Set first warehouse as default if none selected
        set((state) => ({
          currentWarehouse: state.currentWarehouse || warehouses[0] || null,
        }));
      },
    }),
    {
      name: "warehouse-storage",
    }
  )
);
