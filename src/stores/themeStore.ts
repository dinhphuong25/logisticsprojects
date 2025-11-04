import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ThemeState {
  isDark: boolean;
  toggle: () => void;
  setDark: (isDark: boolean) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDark: false,

      toggle: () => {
        set((state) => {
          const newIsDark = !state.isDark;
          // Update document class
          if (newIsDark) {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
          return { isDark: newIsDark };
        });
      },

      setDark: (isDark: boolean) => {
        if (isDark) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
        set({ isDark });
      },
    }),
    {
      name: "theme-storage",
      onRehydrateStorage: () => (state) => {
        // Apply theme on load
        if (state?.isDark) {
          document.documentElement.classList.add("dark");
        }
      },
    }
  )
);
