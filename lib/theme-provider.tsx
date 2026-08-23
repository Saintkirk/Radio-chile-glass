import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Appearance, View, useColorScheme as useSystemColorScheme } from "react-native";
import { colorScheme as nativewindColorScheme, vars } from "nativewind";

import { SchemeColors, type ColorScheme } from "@/constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ThemePreference = ColorScheme | "system";

type ThemeContextValue = {
  colorScheme: ColorScheme;
  preference: ThemePreference;
  setColorScheme: (scheme: ColorScheme) => void;
  setThemePreference: (preference: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useSystemColorScheme() ?? "light";
  // La experiencia de Radio Chile Glass prioriza el escenario oscuro premium de la referencia.
  // El usuario puede cambiarlo posteriormente desde Ajustes.
  const [preference, setPreference] = useState<ThemePreference>("dark");
  const colorScheme = preference === "system" ? systemScheme : preference;

  const applyScheme = useCallback((scheme: ColorScheme) => {
    nativewindColorScheme.set(scheme);
    Appearance.setColorScheme?.(scheme);
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      root.dataset.theme = scheme;
      root.classList.toggle("dark", scheme === "dark");
      const palette = SchemeColors[scheme];
      Object.entries(palette).forEach(([token, value]) => {
        root.style.setProperty(`--color-${token}`, value);
      });
    }
  }, []);

  const setColorScheme = useCallback((scheme: ColorScheme) => {
    setPreference(scheme);
    AsyncStorage.setItem("radio-theme-preference", scheme).catch(() => undefined);
  }, []);

  const setThemePreference = useCallback((next: ThemePreference) => {
    setPreference(next);
    AsyncStorage.setItem("radio-theme-preference", next).catch(() => undefined);
  }, []);

  useEffect(() => {
    AsyncStorage.getItem("radio-theme-preference").then((saved) => {
      if (saved === "light" || saved === "dark" || saved === "system") setPreference(saved);
    }).catch(() => undefined);
  }, []);

  useEffect(() => {
    applyScheme(colorScheme);
  }, [applyScheme, colorScheme]);

  const themeVariables = useMemo(
    () =>
      vars({
        "color-primary": SchemeColors[colorScheme].primary,
        "color-background": SchemeColors[colorScheme].background,
        "color-surface": SchemeColors[colorScheme].surface,
        "color-foreground": SchemeColors[colorScheme].foreground,
        "color-muted": SchemeColors[colorScheme].muted,
        "color-border": SchemeColors[colorScheme].border,
        "color-success": SchemeColors[colorScheme].success,
        "color-warning": SchemeColors[colorScheme].warning,
        "color-error": SchemeColors[colorScheme].error,
      }),
    [colorScheme],
  );

  const value = useMemo(
    () => ({
      colorScheme,
      preference,
      setColorScheme,
      setThemePreference,
    }),
    [colorScheme, preference, setColorScheme, setThemePreference],
  );

  return (
    <ThemeContext.Provider value={value}>
      <View style={[{ flex: 1 }, themeVariables]}>{children}</View>
    </ThemeContext.Provider>
  );
}

export function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useThemeContext must be used within ThemeProvider");
  }
  return ctx;
}
