import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Appearance, View, useColorScheme as useSystemColorScheme } from "react-native";
import { colorScheme as nativewindColorScheme, vars } from "nativewind";

import { SchemeColors, type ColorScheme } from "@/constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DEFAULT_VISUAL_THEME,
  VISUAL_THEMES,
  type VisualTheme,
  type VisualThemeId,
} from "@/lib/visual-themes";

export type ThemePreference = ColorScheme | "system";

type ThemeContextValue = {
  colorScheme: ColorScheme;
  preference: ThemePreference;
  setColorScheme: (scheme: ColorScheme) => void;
  setThemePreference: (preference: ThemePreference) => void;
  visualThemeId: VisualThemeId;
  visualTheme: VisualTheme;
  setVisualTheme: (id: VisualThemeId) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const VISUAL_THEME_KEY = "radio-visual-theme";
const THEME_PREF_KEY = "radio-theme-preference";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useSystemColorScheme() ?? "light";
  const [preference, setPreference] = useState<ThemePreference>("dark");
  const [visualThemeId, setVisualThemeId] = useState<VisualThemeId>(DEFAULT_VISUAL_THEME);
  const colorScheme = preference === "system" ? systemScheme : preference;
  const visualTheme = VISUAL_THEMES[visualThemeId] ?? VISUAL_THEMES[DEFAULT_VISUAL_THEME];

  const applyScheme = useCallback((scheme: ColorScheme, theme: VisualTheme) => {
    nativewindColorScheme.set(scheme);
    Appearance.setColorScheme?.(scheme);
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      root.dataset.theme = scheme;
      root.dataset.visualTheme = theme.id;
      root.classList.toggle("dark", scheme === "dark");
      const palette = SchemeColors[scheme];
      Object.entries(palette).forEach(([token, value]) => {
        root.style.setProperty(`--color-${token}`, value);
      });
      root.style.setProperty("--color-accent-studio", theme.accent);
      root.style.setProperty("--color-ambient-studio", theme.ambient);
      root.style.setProperty("--color-stage-studio", theme.stageBackground);
    }
  }, []);

  const setColorScheme = useCallback((scheme: ColorScheme) => {
    setPreference(scheme);
    AsyncStorage.setItem(THEME_PREF_KEY, scheme).catch(() => undefined);
  }, []);

  const setThemePreference = useCallback((next: ThemePreference) => {
    setPreference(next);
    AsyncStorage.setItem(THEME_PREF_KEY, next).catch(() => undefined);
  }, []);

  const setVisualTheme = useCallback((id: VisualThemeId) => {
    if (!VISUAL_THEMES[id]) return;
    setVisualThemeId(id);
    AsyncStorage.setItem(VISUAL_THEME_KEY, id).catch(() => undefined);
  }, []);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(THEME_PREF_KEY),
      AsyncStorage.getItem(VISUAL_THEME_KEY),
    ])
      .then(([savedPref, savedVisual]) => {
        if (savedPref === "light" || savedPref === "dark" || savedPref === "system") {
          setPreference(savedPref);
        }
        if (savedVisual && savedVisual in VISUAL_THEMES) {
          setVisualThemeId(savedVisual as VisualThemeId);
        }
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    applyScheme(colorScheme, visualTheme);
  }, [applyScheme, colorScheme, visualTheme]);

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
        "color-accent-studio": visualTheme.accent,
        "color-ambient-studio": visualTheme.ambient,
        "color-stage-studio": visualTheme.stageBackground,
      }),
    [colorScheme, visualTheme],
  );

  const value = useMemo(
    () => ({
      colorScheme,
      preference,
      setColorScheme,
      setThemePreference,
      visualThemeId,
      visualTheme,
      setVisualTheme,
    }),
    [
      colorScheme,
      preference,
      setColorScheme,
      setThemePreference,
      visualThemeId,
      visualTheme,
      setVisualTheme,
    ],
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
