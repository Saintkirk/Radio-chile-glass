import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text } from "react-native";
import { useColors } from "@/hooks/use-colors";

export function FavoriteToast({ message }: { message: string | null }) {
  const colors = useColors();
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, { toValue: message ? 1 : 0, duration: 180, useNativeDriver: true }).start();
  }, [message, opacity]);

  if (!message) return null;
  return <Animated.View accessibilityLiveRegion="polite" accessible accessibilityLabel={message} style={[styles.toast, { opacity, backgroundColor: colors.foreground }]}><Text style={[styles.text, { color: colors.background }]}>{message}</Text></Animated.View>;
}

const styles = StyleSheet.create({
  toast: { position: "absolute", alignSelf: "center", bottom: 88, borderRadius: 18, paddingHorizontal: 16, paddingVertical: 11, shadowColor: "#000", shadowOpacity: 0.18, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 5 },
  text: { fontSize: 13, fontWeight: "700" },
});
