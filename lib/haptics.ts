import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";

const HAPTICS_KEY = "radio-haptics-enabled";
let hapticsEnabled = true;

export async function loadHapticsPreference() {
  try {
    const value = await AsyncStorage.getItem(HAPTICS_KEY);
    if (value !== null) hapticsEnabled = value !== "false";
  } catch {
    hapticsEnabled = true;
  }
  return hapticsEnabled;
}

export function setHapticsEnabled(enabled: boolean) {
  hapticsEnabled = enabled;
  void AsyncStorage.setItem(HAPTICS_KEY, String(enabled)).catch(() => undefined);
}

export function favoriteAddedHaptic() {
  if (hapticsEnabled && Platform.OS !== "web") {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }
}

export function favoriteRemovedHaptic() {
  if (hapticsEnabled && Platform.OS !== "web") {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }
}

export function detailOpenedHaptic() {
  if (hapticsEnabled && Platform.OS !== "web") {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
}
