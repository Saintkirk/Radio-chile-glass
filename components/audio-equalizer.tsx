import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

type AudioEqualizerProps = { playing: boolean; color?: string; barCount?: number };

const LEVELS = [0.35, 0.72, 0.48, 0.9, 0.58, 0.8, 0.4];

export function AudioEqualizer({ playing, color = "#FF8C7F", barCount = 7 }: AudioEqualizerProps) {
  const levels = useRef(Array.from({ length: barCount }, (_, index) => new Animated.Value(playing ? LEVELS[index % LEVELS.length] : 0.22))).current;

  useEffect(() => {
    const animations = levels.map((level, index) => Animated.loop(Animated.sequence([
      Animated.delay(index * 55),
      Animated.timing(level, { toValue: 0.2 + LEVELS[(index + 2) % LEVELS.length], duration: 220 + index * 35, useNativeDriver: true }),
      Animated.timing(level, { toValue: 0.18 + LEVELS[(index + 4) % LEVELS.length] * 0.8, duration: 180 + index * 28, useNativeDriver: true }),
    ])));
    if (playing) animations.forEach((animation) => animation.start());
    else levels.forEach((level) => Animated.timing(level, { toValue: 0.22, duration: 180, useNativeDriver: true }).start());
    return () => animations.forEach((animation) => animation.stop());
  }, [levels, playing]);

  return <View accessibilityLabel={playing ? "Ecualizador activo" : "Ecualizador en pausa"} style={styles.container}>{levels.map((level, index) => <Animated.View key={index} style={[styles.bar, { backgroundColor: color, transform: [{ scaleY: level }] }]} />)}</View>;
}

const styles = StyleSheet.create({ container: { height: 30, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4 }, bar: { width: 4, height: 26, borderRadius: 4, opacity: 0.9 }, });
