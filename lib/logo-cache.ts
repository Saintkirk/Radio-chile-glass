import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { imagePrefetchCandidates } from "@/lib/image-format";

const CACHE_KEY = "radio-logo-cache-v2";
const LOGO_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const WARM_DISK_LIMIT = 80;
const HOT_MEMORY_LIMIT = 24;
const HOT_WINDOW_RADIUS = 5;
const PREFETCH_WORKERS = 3;
const FREQUENT_LOGO_LIMIT = 12;
const FREQUENT_RADIO_IDS = [
  "cooperativa",
  "biobio",
  "adn",
  "futuro",
  "concierto",
  "carolina",
  "los40",
  "corazon",
];

export type PrefetchLevel = "hot" | "warm";

type CacheEntry = { uri: string; updatedAt: number };
type LogoSource = { id: string; favicon?: string | null };

let memoryCache: Record<string, CacheEntry> = {};
let loadPromise: Promise<Record<string, CacheEntry>> | null = null;
const hotMemoryCache = new Map<string, number>();
const inFlightUris = new Set<string>();

function readCache(): Promise<Record<string, CacheEntry>> {
  if (!loadPromise) {
    loadPromise = AsyncStorage.getItem(CACHE_KEY)
      .then((raw) => {
        if (!raw) {
          memoryCache = {};
          return memoryCache;
        }
        try {
          const parsed = JSON.parse(raw) as Record<string, CacheEntry>;
          const now = Date.now();
          const validEntries: Record<string, CacheEntry> = {};
          let hasExpired = false;

          for (const [uri, entry] of Object.entries(parsed)) {
            if (now - entry.updatedAt < LOGO_CACHE_TTL_MS) {
              validEntries[uri] = entry;
            } else {
              hasExpired = true;
            }
          }

          if (hasExpired) {
            memoryCache = validEntries;
            AsyncStorage.setItem(CACHE_KEY, JSON.stringify(memoryCache)).catch(() => undefined);
          } else {
            memoryCache = validEntries;
          }
        } catch {
          memoryCache = {};
        }
        return memoryCache;
      })
      .catch(() => {
        memoryCache = {};
        return memoryCache;
      });
  }
  return loadPromise;
}

function touchHot(uri: string) {
  hotMemoryCache.delete(uri);
  hotMemoryCache.set(uri, Date.now());
  while (hotMemoryCache.size > HOT_MEMORY_LIMIT) {
    const oldest = hotMemoryCache.keys().next().value as string | undefined;
    if (!oldest) break;
    hotMemoryCache.delete(oldest);
  }
}

export async function getCachedLogo(uri: string): Promise<string | null> {
  if (!uri) return null;
  const cache = await readCache();
  // Hit on any modern candidate or the original URI.
  for (const candidate of imagePrefetchCandidates(uri)) {
    const entry = cache[candidate];
    if (entry) {
      entry.updatedAt = Date.now();
      return entry.uri;
    }
  }
  return null;
}

export async function rememberLogo(uri: string): Promise<void> {
  if (!uri) return;
  const cache = await readCache();
  cache[uri] = { uri, updatedAt: Date.now() };
  const entries = Object.entries(cache)
    .sort(([, first], [, second]) => second.updatedAt - first.updatedAt)
    .slice(0, WARM_DISK_LIMIT);
  memoryCache = Object.fromEntries(entries);
  await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(memoryCache));
}

export async function prefetchLogo(uri: string, level: PrefetchLevel = "warm"): Promise<boolean> {
  if (!uri) return false;
  if (level === "hot") touchHot(uri);
  if (await getCachedLogo(uri)) return true;

  const candidates = imagePrefetchCandidates(uri);
  for (const candidate of candidates) {
    if (inFlightUris.has(candidate)) continue;
    inFlightUris.add(candidate);
    try {
      const policy = level === "hot" ? "memory-disk" : "disk";
      const loaded = await Image.prefetch(candidate, policy);
      if (loaded) {
        await rememberLogo(candidate);
        // Also key the original URI so callers keep a stable cache lookup.
        if (candidate !== uri) await rememberLogo(uri);
        return true;
      }
    } catch {
      // try next format candidate
    } finally {
      inFlightUris.delete(candidate);
    }
  }
  return false;
}

/** Precarga solo la ventana inmediata que el usuario puede alcanzar en el siguiente gesto. */
export async function prefetchLogoWindow(
  radios: LogoSource[],
  centerIndex: number,
  radius = HOT_WINDOW_RADIUS,
): Promise<void> {
  if (!radios.length) return;
  const { getLogoPrefetchUris } = await import("@/lib/logo-prefetch");
  const queue = getLogoPrefetchUris(radios, centerIndex, radius);
  const worker = async () => {
    while (queue.length) {
      const next = queue.shift();
      if (next) await prefetchLogo(next, "hot");
    }
  };
  await Promise.all(Array.from({ length: PREFETCH_WORKERS }, worker));
}

/** Calienta únicamente las emisoras de acceso frecuente; el resto se carga bajo demanda. */
export async function prefetchFrequentLogos(radios: LogoSource[]): Promise<void> {
  const byId = new Map(radios.map((radio) => [radio.id, radio]));
  const uniqueUris = [
    ...new Set(
      FREQUENT_RADIO_IDS.map((id) => byId.get(id)?.favicon).filter((u): u is string => Boolean(u)),
    ),
  ].slice(0, FREQUENT_LOGO_LIMIT);

  for (const uri of uniqueUris) {
    if (await getCachedLogo(uri)) continue;
    await prefetchLogo(uri, "warm");
  }
}

export async function clearLogoCache(): Promise<void> {
  memoryCache = {};
  hotMemoryCache.clear();
  inFlightUris.clear();
  loadPromise = Promise.resolve(memoryCache);
  await AsyncStorage.removeItem(CACHE_KEY);
  await Image.clearMemoryCache();
  await Image.clearDiskCache();
}
