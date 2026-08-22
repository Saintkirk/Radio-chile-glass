import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";

const CACHE_KEY = "radio-logo-cache-v1";
const MAX_ENTRIES = 150;

type LogoCache = Record<string, { uri: string; updatedAt: number }>;

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
  const cache = await readCache();
  return cache[uri]?.uri ?? null;
}

export async function rememberLogo(uri: string): Promise<void> {
  if (!uri) return;
  const cache = await readCache();
  cache[uri] = { uri, updatedAt: Date.now() };
  const entries = Object.entries(cache).sort(([, a], [, b]) => b.updatedAt - a.updatedAt).slice(0, MAX_ENTRIES);
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

export async function clearLogoCache(): Promise<void> {
  memoryCache = {};
  loadPromise = Promise.resolve(memoryCache);
  await AsyncStorage.removeItem(CACHE_KEY);
  await Image.clearMemoryCache();
  await Image.clearDiskCache();
}
