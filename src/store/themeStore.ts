import { create } from "zustand";
import { ThemeMode } from "../types/theme";

type ThemeStoreState = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
};

export const useThemeStore = create<ThemeStoreState>((set) => ({
  mode: "dark",
  setMode(mode) {
    set({ mode });
  },
  toggleMode() {
    set((state) => ({
      mode: state.mode === "dark" ? "light" : "dark"
    }));
  }
}));

