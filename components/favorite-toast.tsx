import { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text } from "react-native";
import { useColors } from "@/hooks/use-colors";

export function FavoriteToast({ message }: { message: string | null }) {
  const colors = useColors();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(8)).current;
  const [visibleMessage, setVisibleMessage] = useState<string | null>(message);

  useEffect(() => {
    if (message) {
      setVisibleMessage(message);
      opacity.stopAnimation();
      translateY.stopAnimation();
      opacity.setValue(0);
      translateY.setValue(8);
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start();
      return;
    }

    const animation = Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 160, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 8, duration: 160, useNativeDriver: true }),
    ]);
    animation.start(({ finished }) => {
      if (finished) setVisibleMessage(null);
    });
    return () => animation.stop();
  }, [message, opacity, translateY]);

  if (!visibleMessage) return null;
  return <Animated.View accessibilityLiveRegion="polite" accessible accessibilityLabel={visibleMessage} style={[styles.toast, { opacity, backgroundColor: colors.foreground, transform: [{ translateY }] }]}><Text style={[styles.text, { color: colors.background }]}>{visibleMessage}</Text></Animated.View>;
}

const styles = StyleSheet.create({
  toast: { position: "absolute", alignSelf: "center", bottom: 88, borderRadius: 18, paddingHorizontal: 16, paddingVertical: 11, shadowColor: "#000", shadowOpacity: 0.18, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 5 },
  text: { fontSize: 13, fontWeight: "700" },
});
