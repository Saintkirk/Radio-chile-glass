/**
 * Visual studio themes for Radio Chile Glass.
 * These sit on top of the light/dark color scheme and control atmosphere,
 * accent behavior, glass intensity and motion character.
 */

export type VisualThemeId =
  | "liquid-glass"
  | "warm-editorial"
  | "industrial-minimal"
  | "soft-atmospheric";

export type VisualTheme = {
  id: VisualThemeId;
  name: string;
  nameEs: string;
  description: string;
  descriptionEs: string;
  /** Primary accent used for live badges, active states and CTAs */
  accent: string;
  /** Secondary ambient color (halos, subtle glows) */
  ambient: string;
  /** Background base for the main stage */
  stageBackground: string;
  /** Glass surface opacity multiplier (0–1) */
  glassOpacity: number;
  /** Whether the Cover Flow uses stronger 3D perspective */
  strongPerspective: boolean;
  /** Motion character: "cinematic" | "calm" | "snappy" | "soft" */
  motion: "cinematic" | "calm" | "snappy" | "soft";
  /** Cover Flow transition duration base in ms */
  transitionMs: number;
  /** Easing curve for carousel transitions */
  easing: [number, number, number, number];
};

export const VISUAL_THEMES: Record<VisualThemeId, VisualTheme> = {
  "liquid-glass": {
    id: "liquid-glass",
    name: "Liquid Glass",
    nameEs: "Vidrio Líquido",
    description: "Nocturnal premium glass with coral accents and violet atmosphere",
    descriptionEs: "Vidrio premium nocturno con acentos coral y atmósfera violeta",
    accent: "#FF6B5A",
    ambient: "#7B4DAB",
    stageBackground: "#090A10",
    glassOpacity: 0.08,
    strongPerspective: true,
    motion: "cinematic",
    transitionMs: 420,
    easing: [0.18, 0.82, 0.22, 1],
  },
  "warm-editorial": {
    id: "warm-editorial",
    name: "Warm Editorial",
    nameEs: "Editorial Cálido",
    description: "Warm oak tones, soft daylight simulation and calm hierarchy",
    descriptionEs: "Tonos de roble cálidos, simulación de luz diurna y jerarquía calmada",
    accent: "#E07A5F",
    ambient: "#C9A86C",
    stageBackground: "#1A1612",
    glassOpacity: 0.06,
    strongPerspective: false,
    motion: "calm",
    transitionMs: 480,
    easing: [0.25, 0.1, 0.25, 1],
  },
  "industrial-minimal": {
    id: "industrial-minimal",
    name: "Industrial Minimal",
    nameEs: "Industrial Mínimo",
    description: "Hard edges, high contrast, linear light and serious broadcast feel",
    descriptionEs: "Bordes duros, alto contraste, luz lineal y sensación broadcast seria",
    accent: "#00E5FF",
    ambient: "#1A1A1A",
    stageBackground: "#0D0D0D",
    glassOpacity: 0.04,
    strongPerspective: true,
    motion: "snappy",
    transitionMs: 320,
    easing: [0.2, 0.9, 0.3, 1],
  },
  "soft-atmospheric": {
    id: "soft-atmospheric",
    name: "Soft Atmospheric",
    nameEs: "Atmosférico Suave",
    description: "Dreamy gradients, rounded forms and late-night radio mood",
    descriptionEs: "Gradientes oníricos, formas redondeadas y mood de radio nocturna",
    accent: "#C77DFF",
    ambient: "#5B8DEF",
    stageBackground: "#0E0B1A",
    glassOpacity: 0.1,
    strongPerspective: false,
    motion: "soft",
    transitionMs: 520,
    easing: [0.33, 0.0, 0.2, 1],
  },
};

export const DEFAULT_VISUAL_THEME: VisualThemeId = "liquid-glass";

export const VISUAL_THEME_LIST = Object.values(VISUAL_THEMES);
