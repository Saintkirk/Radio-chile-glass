import { Platform } from "react-native";

export type ModernImageFormat = "avif" | "webp" | "original";

export type ImageUriSource = { uri: string };

const DATA_OR_FILE = /^(data:|file:|content:|asset:)/i;
const ABSOLUTE_HTTP = /^https?:\/\//i;

/** Android 12+ (API 31) and iOS 16+ decode AVIF in production builds. */
export function supportsAvif(): boolean {
  if (Platform.OS === "android") {
    return typeof Platform.Version === "number" && Platform.Version >= 31;
  }
  if (Platform.OS === "ios") {
    const major = parseInt(String(Platform.Version).split(".")[0] ?? "0", 10);
    return major >= 16;
  }
  // Web / others: assume modern browsers handle AVIF.
  return true;
}

/** WebP is supported by expo-image on Android, iOS, and web. */
export function supportsWebp(): boolean {
  return true;
}

function stripQueryAndHash(url: string): { base: string; suffix: string } {
  const hashIndex = url.indexOf("#");
  const queryIndex = url.indexOf("?");
  let cut = url.length;
  if (queryIndex >= 0) cut = Math.min(cut, queryIndex);
  if (hashIndex >= 0) cut = Math.min(cut, hashIndex);
  return { base: url.slice(0, cut), suffix: url.slice(cut) };
}

/** Replace the last path extension, preserving query/hash. */
export function replaceImageExtension(url: string, ext: string): string {
  const { base, suffix } = stripQueryAndHash(url);
  const dot = base.lastIndexOf(".");
  const slash = Math.max(base.lastIndexOf("/"), base.lastIndexOf("\\"));
  if (dot <= slash) return `${base}.${ext}${suffix}`;
  return `${base.slice(0, dot)}.${ext}${suffix}`;
}

export function getImageExtension(url: string): string | null {
  const { base } = stripQueryAndHash(url);
  const dot = base.lastIndexOf(".");
  const slash = Math.max(base.lastIndexOf("/"), base.lastIndexOf("\\"));
  if (dot <= slash) return null;
  return base.slice(dot + 1).toLowerCase();
}

/**
 * Build candidate URIs in preference order: AVIF → WebP → original.
 * Used with expo-image multi-source so the first URI that loads wins.
 * Extension swaps are best-effort; many station CDNs only host PNG/JPG.
 */
export function modernImageSources(uri: string | null | undefined): ImageUriSource[] {
  if (!uri || !uri.trim()) return [];
  const trimmed = uri.trim();
  if (DATA_OR_FILE.test(trimmed) || !ABSOLUTE_HTTP.test(trimmed)) {
    return [{ uri: trimmed }];
  }

  const ext = getImageExtension(trimmed);
  if (ext === "svg" || ext === "gif" || ext === "ico") {
    return [{ uri: trimmed }];
  }

  const seen = new Set<string>();
  const sources: ImageUriSource[] = [];
  const push = (candidate: string) => {
    if (!candidate || seen.has(candidate)) return;
    seen.add(candidate);
    sources.push({ uri: candidate });
  };

  if (supportsAvif() && ext !== "avif") {
    push(replaceImageExtension(trimmed, "avif"));
  }
  if (supportsWebp() && ext !== "webp") {
    push(replaceImageExtension(trimmed, "webp"));
  }
  push(trimmed);
  return sources;
}

/** Preferred single URI for prefetch (first modern candidate). */
export function preferredImageUri(uri: string | null | undefined): string | null {
  const sources = modernImageSources(uri);
  return sources[0]?.uri ?? null;
}

/** Ordered unique URIs to try during prefetch (modern first, then original). */
export function imagePrefetchCandidates(uri: string | null | undefined): string[] {
  return modernImageSources(uri).map((s) => s.uri);
}
