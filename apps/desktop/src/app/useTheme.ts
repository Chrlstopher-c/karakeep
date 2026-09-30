import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type ThemePreference = "night" | "clair" | "systeme";

const STORAGE_KEY = "savoir.theme";

function readPreference(): ThemePreference {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "clair" || value === "systeme" ? value : "night";
  } catch {
    return "night";
  }
}

function resolve(pref: ThemePreference): "night" | "clair" {
  if (pref !== "systeme") return pref;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "clair" : "night";
}

export function useTheme(): {
  preference: ThemePreference;
  setPreference: (p: ThemePreference) => void;
} {
  const [preference, setPref] = useState<ThemePreference>(readPreference);

  useEffect(() => {
    const apply = (): void => {
      document.documentElement.dataset.theme = resolve(preference);
    };
    apply();
    const media = window.matchMedia("(prefers-color-scheme: light)");
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [preference]);

  const setPreference = useCallback((p: ThemePreference) => {
    setPref(p);
    try {
      localStorage.setItem(STORAGE_KEY, p);
    } catch {
      // Préférence non mémorisée (stockage indisponible) : le thème s'applique quand même.
    }
  }, []);

  return { preference, setPreference };
}

export interface ThemeControl {
  preference: ThemePreference;
  setPreference: (p: ThemePreference) => void;
}

export const ThemeContext = createContext<ThemeControl | null>(null);

export function useThemeControl(): ThemeControl {
  const theme = useContext(ThemeContext);
  if (!theme) throw new Error("useThemeControl hors de ThemeContext");
  return theme;
}
