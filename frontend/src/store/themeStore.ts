import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ThemeStore {
  isDark: boolean;
  toggle: () => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      isDark: false,
      toggle: () =>
        set((s) => {
          const next = !s.isDark;
          document.documentElement.setAttribute(
            "data-theme",
            next ? "dark" : "light"
          );
          return { isDark: next };
        }),
    }),
    { name: "insightiq-theme" }
  )
);