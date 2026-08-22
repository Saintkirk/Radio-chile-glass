import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";

const HAPTICS_KEY = "radio-haptics-preferences";
const LEGACY_HAPTICS_KEY = "radio-haptics-enabled";

export type HapticPreferences = { navigation: boolean; actions: boolean };
export const DEFAULT_HAPTICS: HapticPreferences = { navigation: true, actions: true };
let hapticsPreferences: HapticPreferences = { ...DEFAULT_HAPTICS };

export async function loadHapticsPreferences(): Promise<HapticPreferences> {
  try {
    const value = await AsyncStorage.getItem(HAPTICS_KEY);
    if (value) {
      hapticsPreferences = { ...DEFAULT_HAPTICS, ...JSON.parse(value) };
    } else {
      const legacy = await AsyncStorage.getItem(LEGACY_HAPTICS_KEY);
      if (legacy !== null) hapticsPreferences = { navigation: legacy !== "false", actions: legacy !== "false" };
    }
  } catch {
    hapticsPreferences = { ...DEFAULT_HAPTICS };
  }
  return { ...hapticsPreferences };
}

export async function setHapticsPreference(kind: keyof HapticPreferences, enabled: boolean) {
  hapticsPreferences = { ...hapticsPreferences, [kind]: enabled };
  try {
    await AsyncStorage.setItem(HAPTICS_KEY, JSON.stringify(hapticsPreferences));
    return true;
  } catch {
    return false;
  }
}

export function navigationHaptic() {
  if (hapticsPreferences.navigation && Platform.OS !== "web") void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export function favoriteAddedHaptic() {
  if (hapticsPreferences.actions && Platform.OS !== "web") void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

export function favoriteRemovedHaptic() {
  if (hapticsPreferences.actions && Platform.OS !== "web") void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}

export function detailOpenedHaptic() {
  navigationHaptic();
}
