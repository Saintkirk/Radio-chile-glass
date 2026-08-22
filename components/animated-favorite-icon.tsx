import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, StyleSheet, View } from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";

export function AnimatedFavoriteIcon({ active, color }: { active: boolean; color: string }) {
  const scale = useRef(new Animated.Value(1)).current;
  const previousActive = useRef(active);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setReduceMotion(enabled);
    });
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotion);
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (previousActive.current === active) return;
    previousActive.current = active;
    if (reduceMotion) {
      scale.setValue(1);
      return;
    }
    scale.setValue(active ? 1.2 : 0.86);
    Animated.timing(scale, { toValue: 1, duration: 180, useNativeDriver: true }).start();
  }, [active, reduceMotion, scale]);

  return <View style={styles.container}><Animated.View style={{ transform: [{ scale }] }}><IconSymbol name={active ? "heart.fill" : "heart"} size={20} color={color} /></Animated.View></View>;
}

const styles = StyleSheet.create({ container: { width: 20, height: 20, alignItems: "center", justifyContent: "center" } });
