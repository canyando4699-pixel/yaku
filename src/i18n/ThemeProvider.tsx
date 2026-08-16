"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { subscribeNoop } from "@/lib/useIsClient";

export type ThemeMode = "light" | "dark";

const STORAGE_KEY = "yaku-theme";

type ThemeContextValue = {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function isTheme(value: string | null): value is ThemeMode {
  return value === "light" || value === "dark";
}

function getThemeSnapshot(): ThemeMode {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return isTheme(stored) ? stored : "dark";
}

function getThemeServerSnapshot(): ThemeMode {
  return "dark";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const storedTheme = useSyncExternalStore(
    subscribeNoop,
    getThemeSnapshot,
    getThemeServerSnapshot,
  );
  const [themeOverride, setThemeOverride] = useState<ThemeMode | null>(null);
  const theme = themeOverride ?? storedTheme;

  const setTheme = useCallback((next: ThemeMode) => {
    setThemeOverride(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const toggleTheme = useCallback(() => {
    const next = (themeOverride ?? storedTheme) === "dark" ? "light" : "dark";
    setThemeOverride(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, [themeOverride, storedTheme]);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
