import { Platform } from "react-native";
import * as Haptics from "expo-haptics";

export function favoriteHaptic() {
  if (Platform.OS !== "web") {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }
}
