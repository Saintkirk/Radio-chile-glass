import { Platform, type ViewStyle } from "react-native";

type ShadowOptions = {
  color: string;
  opacity: number;
  radius: number;
  offsetX?: number;
  offsetY?: number;
  elevation?: number;
};

function colorWithOpacity(color: string, opacity: number) {
  const normalized = color.replace("#", "");
  const hex = normalized.length === 3
    ? normalized.split("").map((part) => `${part}${part}`).join("")
    : normalized.slice(0, 6).padEnd(6, "0");
  const alpha = Math.max(0, Math.min(1, opacity));
  return `#${hex}${Math.round(alpha * 255).toString(16).padStart(2, "0")}`;
}

/**
 * Uses the CSS boxShadow format on web to avoid React Native Web deprecation
 * warnings, while retaining platform-native shadow controls on Android/iOS.
 */
export function platformShadow({
  color,
  opacity,
  radius,
  offsetX = 0,
  offsetY = 0,
  elevation = 0,
}: ShadowOptions): ViewStyle {
  if (Platform.OS === "web") {
    const blur = Math.max(0, Math.round(radius * 1.35));
    return {
      boxShadow: `${offsetX}px ${offsetY}px ${blur}px 0px ${colorWithOpacity(color, opacity)}`,
    } as ViewStyle;
  }

  return {
    shadowColor: color,
    shadowOpacity: opacity,
    shadowRadius: radius,
    shadowOffset: { width: offsetX, height: offsetY },
    elevation,
  };
}

export const nonInteractiveStyle = { pointerEvents: "none" } as const;
