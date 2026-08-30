import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { getLogoPrefetchUris } from "@/lib/logo-prefetch";

type LogoSource = { id: string; favicon?: string | null };
type LogoCache = Record<string, { uri: string; updatedAt: number }>;
type PrefetchLevel = "hot" | "warm";

const CACHE_KEY = "radio-logo-cache-v3";
const HOT_MEMORY_LIMIT = 5;
const WARM_DISK_LIMIT = 64;
const HOT_WINDOW_RADIUS = 2;
const PREFETCH_WORKERS = 2;
const FREQUENT_LOGO_LIMIT = 8;
const LOGO_CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 días TTL para logos
const FREQUENT_RADIO_IDS = [
  "fmlatina", "carolina", "futuro", "cooperativa", "biobio", "corazon", "oasis", "13c",
  "rock-pop", "concierto", "duna", "adn",
];

let memoryCache: LogoCache | null = null;
let loadPromise: Promise<LogoCache> | null = null;
const inFlightUris = new Set<string>();
const hotMemoryCache = new Map<string, number>();

async function readCache(): Promise<LogoCache> {
  if (memoryCache) return memoryCache;
  if (!loadPromise) {
    loadPromise = AsyncStorage.getItem(CACHE_KEY)
      .then((value) => {
        try {
          const parsed = value ? JSON.parse(value) as LogoCache : {};
          memoryCache = parsed && typeof parsed === "object" ? parsed : {};
          
          // Invalidate expired logos (TTL cleanup)
          const now = Date.now();
          const validEntries: LogoCache = {};
          let hasExpired = false;
          
          for (const [uri, entry] of Object.entries(memoryCache)) {
            if (now - entry.updatedAt < LOGO_CACHE_TTL_MS) {
              validEntries[uri] = entry;
            } else {
              hasExpired = true;
            }
          }
          
          if (hasExpired) {
            memoryCache = validEntries;
            AsyncStorage.setItem(CACHE_KEY, JSON.stringify(memoryCache)).catch(() => undefined);
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
  const entry = cache[uri];
  if (!entry) return null;
  entry.updatedAt = Date.now();
  return entry.uri;
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
  if (inFlightUris.has(uri)) return false;

  inFlightUris.add(uri);
  try {
    // `hot` keeps the active window reusable in RAM; `warm` leaves the rest on disk.
    const loaded = await Image.prefetch(uri, level === "hot" ? "memory-disk" : "disk");
    if (loaded) await rememberLogo(uri);
    return loaded;
  } catch {
    return false;
  } finally {
    inFlightUris.delete(uri);
  }
}

/** Precarga solo la ventana inmediata que el usuario puede alcanzar en el siguiente gesto. */
export async function prefetchLogoWindow(
  radios: LogoSource[],
  centerIndex: number,
  radius = HOT_WINDOW_RADIUS,
): Promise<void> {
  if (!radios.length) return;
  const queue = getLogoPrefetchUris(radios, centerIndex, radius);
  const worker = async () => {
    while (queue.length) {
      const uri = queue.shift();
      if (uri) await prefetchLogo(uri, "hot");
    }
  };
  await Promise.all(Array.from({ length: PREFETCH_WORKERS }, worker));
}

/** Calienta únicamente las emisoras de acceso frecuente; el resto se carga bajo demanda. */
export async function prefetchFrequentLogos(radios: LogoSource[]): Promise<void> {
  const byId = new Map(radios.map((radio) => [radio.id, radio]));
  const uniqueUris = [...new Set(
    FREQUENT_RADIO_IDS
      .map((id) => byId.get(id)?.favicon)
      .filter((uri): uri is string => Boolean(uri)),
  )].slice(0, FREQUENT_LOGO_LIMIT);

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
