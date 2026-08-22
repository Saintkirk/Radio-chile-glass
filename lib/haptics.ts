import { Platform } from "react-native";
import * as Haptics from "expo-haptics";

export function favoriteAddedHaptic() {
  if (Platform.OS !== "web") {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }
}

export function favoriteRemovedHaptic() {
  if (Platform.OS !== "web") {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }
}
