import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

export const FAVORITES_STORAGE_KEY = "radio-favorites";

function readWebStorage(): Storage | null {
  if (Platform.OS !== "web" || typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function parseFavoriteIds(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string" && id.length > 0) : [];
  } catch {
    return [];
  }
}

export async function loadFavoriteIds(): Promise<string[]> {
  const webStorage = readWebStorage();
  if (webStorage) return parseFavoriteIds(webStorage.getItem(FAVORITES_STORAGE_KEY));
  return parseFavoriteIds(await AsyncStorage.getItem(FAVORITES_STORAGE_KEY));
}

export async function saveFavoriteIds(ids: string[]): Promise<void> {
  const value = JSON.stringify(Array.from(new Set(ids)));
  const webStorage = readWebStorage();
  if (webStorage) {
    webStorage.setItem(FAVORITES_STORAGE_KEY, value);
    return;
  }
  await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, value);
}
