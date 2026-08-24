import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";

type LogoSource = { id: string; favicon?: string | null };
type LogoCache = Record<string, { uri: string; updatedAt: number }>;

const CACHE_KEY = "radio-logo-cache-v2";
const MAX_ENTRIES = 150;
const FREQUENT_RADIO_IDS = [
  "fmlatina",
  "carolina",
  "futuro",
  "cooperativa",
  "biobio",
  "corazon",
  "oasis",
  "13c",
  "rock-pop",
  "concierto",
  "duna",
  "adn",
];

let memoryCache: LogoCache | null = null;
let loadPromise: Promise<LogoCache> | null = null;

async function readCache(): Promise<LogoCache> {
  if (memoryCache) return memoryCache;
  if (!loadPromise) {
    loadPromise = AsyncStorage.getItem(CACHE_KEY)
      .then((value) => {
        try {
          const parsed = value ? JSON.parse(value) as LogoCache : {};
          memoryCache = parsed && typeof parsed === "object" ? parsed : {};
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

export async function getCachedLogo(uri: string): Promise<string | null> {
  if (!uri) return null;
  const cache = await readCache();
  return cache[uri]?.uri ?? null;
}

export async function rememberLogo(uri: string): Promise<void> {
  if (!uri) return;
  const cache = await readCache();
  cache[uri] = { uri, updatedAt: Date.now() };
  const entries = Object.entries(cache)
    .sort(([, first], [, second]) => second.updatedAt - first.updatedAt)
    .slice(0, MAX_ENTRIES);
  memoryCache = Object.fromEntries(entries);
  await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(memoryCache));
}

export async function prefetchLogo(uri: string): Promise<boolean> {
  if (!uri) return false;
  try {
    const loaded = await Image.prefetch(uri, "memory-disk");
    if (loaded) await rememberLogo(uri);
    return loaded;
  } catch {
    return false;
  }
}

/** Calienta primero los logos más usados y luego completa con el resto del catálogo. */
export async function prefetchFrequentLogos(radios: LogoSource[]): Promise<void> {
  const byId = new Map(radios.map((radio) => [radio.id, radio]));
  const ordered = [
    ...FREQUENT_RADIO_IDS.map((id) => byId.get(id)),
    ...radios,
  ];
  const uniqueUris = [...new Set(
    ordered
      .filter((radio): radio is LogoSource => Boolean(radio?.favicon))
      .map((radio) => radio.favicon as string),
  )];

  // Se precarga de forma secuencial para no saturar la red ni competir con el audio.
  for (const uri of uniqueUris) {
    if (await getCachedLogo(uri)) continue;
    await prefetchLogo(uri);
  }
}

export async function clearLogoCache(): Promise<void> {
  memoryCache = {};
  loadPromise = Promise.resolve(memoryCache);
  await AsyncStorage.removeItem(CACHE_KEY);
  await Image.clearMemoryCache();
  await Image.clearDiskCache();
}
