export function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.replace("#", "");
  const value = normalized.length === 3 ? normalized.split("").map((char) => char + char).join("") : normalized;
  if (!/^[0-9a-fA-F]{6}$/.test(value)) throw new Error(`Invalid hex color: ${hex}`);
  return [0, 2, 4].map((index) => Number.parseInt(value.slice(index, index + 2), 16)) as [number, number, number];
}

function luminanceChannel(channel: number) {
  const sRgb = channel / 255;
  return sRgb <= 0.03928 ? sRgb / 12.92 : ((sRgb + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(hex: string) {
  const [red, green, blue] = hexToRgb(hex);
  return 0.2126 * luminanceChannel(red) + 0.7152 * luminanceChannel(green) + 0.0722 * luminanceChannel(blue);
}

export function contrastRatio(foreground: string, background: string) {
  const foregroundLuminance = relativeLuminance(foreground);
  const backgroundLuminance = relativeLuminance(background);
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);
  return (lighter + 0.05) / (darker + 0.05);
}
