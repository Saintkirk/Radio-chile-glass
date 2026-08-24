import { useEffect, useMemo, useRef, useState } from "react";
import { AccessibilityInfo, ActivityIndicator, PanResponder, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  cancelAnimation,
  type SharedValue,
} from "react-native-reanimated";

import { StationLogo } from "@/components/station-logo";
import { IconSymbol } from "@/components/ui/icon-symbol";
import type { Radio } from "@/lib/radio-player";

type Side = -1 | 0 | 1;

function useCardAnimatedStyle(side: Side, motion: SharedValue<number>, direction: SharedValue<number>, reduceMotion: boolean) {
  return useAnimatedStyle(() => {
    const dir = direction.get();
    if (reduceMotion) {
      return {
        opacity: 1,
        transform: [
          { perspective: 900 },
          { translateX: 0 },
          { translateY: 0 },
          { scale: side === 0 ? 1 : 0.82 },
          { rotateY: "0deg" },
        ],
      };
    }

    const startX = side === 0 ? dir * 230 : side === -dir ? side * 156 : side * 190;
    const endX = side === 0 ? 0 : side * 8;
    const startRotation = side === 0 ? (dir > 0 ? -28 : 28) : side === -dir ? 0 : side === -1 ? 42 : -42;
    const targetRotation = side === -1 ? 34 : side === 1 ? -34 : 0;
    const progress = motion.get();

    return {
      opacity: side === 0 ? interpolate(progress, [0, 0.7, 1], [0.35, 0.8, 1], Extrapolation.CLAMP) : interpolate(progress, [0, 1], [0.35, 0.85], Extrapolation.CLAMP),
      transform: [
        { perspective: 900 },
        { translateX: interpolate(progress, [0, 1], [startX, endX], Extrapolation.CLAMP) },
        { translateY: interpolate(progress, [0, 1], side === 0 ? [8, 0] : [12, 4], Extrapolation.CLAMP) },
        { scale: side === 0 ? interpolate(progress, [0, 0.72, 1], [0.84, 0.96, 1], Extrapolation.CLAMP) : interpolate(progress, [0, 1], [0.68, 0.82], Extrapolation.CLAMP) },
        { rotateY: `${interpolate(progress, [0, 1], [startRotation, targetRotation], Extrapolation.CLAMP)}deg` },
      ],
    };
  }, [direction, motion, reduceMotion, side]);
}

export function CoverFlowCarousel({ radios, activeIndex, onChange, onPlay, isPlaying, isLoading, currentRadioId, lightMode = false }: { radios: Radio[]; activeIndex: number; onChange: (direction: number) => void; onPlay: () => void; isPlaying: boolean; isLoading: boolean; currentRadioId?: string; lightMode?: boolean }) {
  const motion = useSharedValue(1);
  const glow = useSharedValue(0);
  const direction = useSharedValue(1);
  const directionRef = useRef(1);
  const [reduceMotion, setReduceMotion] = useState(false);
  const active = radios[activeIndex];
  const previous = radios.length ? radios[(activeIndex - 1 + radios.length) % radios.length] : undefined;
  const next = radios.length ? radios[(activeIndex + 1) % radios.length] : undefined;
  const centerStyle = useCardAnimatedStyle(0, motion, direction, reduceMotion);
  const previousStyle = useCardAnimatedStyle(-1, motion, direction, reduceMotion);
  const nextStyle = useCardAnimatedStyle(1, motion, direction, reduceMotion);
  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(glow.get(), [0, 1], [0.12, 0.32], Extrapolation.CLAMP),
    transform: [{ scale: interpolate(glow.get(), [0, 1], [0.94, 1.08], Extrapolation.CLAMP) }],
  }), [glow]);
  const innerGlowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(glow.get(), [0, 1], [0.08, 0.18], Extrapolation.CLAMP),
  }), [glow]);

  useEffect(() => {
    cancelAnimation(motion);
    if (reduceMotion) {
      motion.set(1);
      return undefined;
    }
    motion.set(0);
    motion.set(withTiming(1, { duration: 300, easing: Easing.bezier(0.22, 1, 0.36, 1) }));
    return undefined;
  }, [activeIndex, motion, reduceMotion]);

  useEffect(() => {
    cancelAnimation(glow);
    if (reduceMotion || !isPlaying || !active || currentRadioId !== active.id) {
      glow.set(0);
      return undefined;
    }
    glow.set(withRepeat(withSequence(
      withTiming(1, { duration: 1250 }),
      withTiming(0, { duration: 1250 }),
    ), -1, false));
    return undefined;
  }, [active, currentRadioId, glow, isPlaying, reduceMotion]);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion).catch(() => undefined);
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotion);
    return () => subscription.remove();
  }, []);

  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > Math.abs(gesture.dy) && Math.abs(gesture.dx) > 8,
    onPanResponderRelease: (_, gesture) => {
      if (Math.abs(gesture.dx) < 48 || Math.abs(gesture.dx) < Math.abs(gesture.dy) * 1.15) return;
      const nextDirection = gesture.dx < 0 ? 1 : -1;
      directionRef.current = nextDirection;
      direction.set(nextDirection);
      onChange(nextDirection);
    },
  }), [direction, onChange]);

  if (!active) return null;

  const requestChange = (nextDirection: number) => {
    const normalized = nextDirection < 0 ? -1 : 1;
    directionRef.current = normalized;
    direction.set(normalized);
    onChange(normalized);
  };

  const sideCard = (radio: Radio | undefined, side: -1 | 1, animatedStyle: ReturnType<typeof useCardAnimatedStyle>) => radio ? (
    <Pressable onPress={() => requestChange(side)} accessibilityRole="button" accessibilityLabel={`Ir a ${radio.name}`} style={[styles.sideSlot, side === -1 ? styles.sideLeft : styles.sideRight]}>
      <Animated.View style={[styles.cover, styles.sideCover, animatedStyle, { backgroundColor: `${radio.accent}32` }]}>
        <StationLogo radio={radio} size={124} radius={20} />
        <View style={styles.sideShade} />
      </Animated.View>
      <View style={styles.reflection}><StationLogo radio={radio} size={124} radius={20} /></View>
    </Pressable>
  ) : null;

  return (
    <View {...panResponder.panHandlers} style={[styles.root, lightMode && styles.rootLight]} accessibilityLabel="Carrusel de emisoras">
      <View style={styles.stage}>
        {sideCard(previous, -1, previousStyle)}
        <Animated.View style={[styles.centerSlot, centerStyle]}>
          <Animated.View pointerEvents="none" style={[styles.outerGlow, glowStyle, { backgroundColor: active.accent }]} />
          <View style={[styles.cover, styles.centerCover, { backgroundColor: `${active.accent}32` }]}>
            <Animated.View pointerEvents="none" style={[styles.innerGlow, innerGlowStyle, { backgroundColor: active.accent }]} />
            <Pressable disabled={isLoading} onPress={onPlay} accessibilityRole="button" accessibilityLabel={isLoading ? `Conectando con ${active.name}` : currentRadioId === active.id && isPlaying ? `Pausar ${active.name}` : `Reproducir ${active.name}`} style={styles.centerPressable}>
              <StationLogo radio={active} size={184} radius={27} />
              {isLoading && <View pointerEvents="none" style={styles.bufferingOverlay}><ActivityIndicator size="large" color="#F5F3EE" /><Text style={styles.bufferingText}>Conectando…</Text></View>}
              <View pointerEvents="none" style={styles.diagonalSheen} />
              <View pointerEvents="none" style={styles.centerGloss} />
            </Pressable>
          </View>
          <View style={styles.centerReflection}><StationLogo radio={active} size={184} radius={27} /></View>
        </Animated.View>
        {sideCard(next, 1, nextStyle)}
      </View>
      <View style={styles.captionRow}>
        <Pressable onPress={() => requestChange(-1)} accessibilityRole="button" accessibilityLabel="Emisora anterior" style={({ pressed }) => [styles.arrow, pressed && styles.pressed]}><IconSymbol name="chevron.left" size={20} color="#F5F3EE" /></Pressable>
        <View style={styles.caption}><Text style={[styles.stationName, lightMode && styles.stationNameLight]} numberOfLines={1}>{active.name}</Text><Text style={[styles.stationMeta, lightMode && styles.stationMetaLight]}>{active.frequency}  ·  {active.genre}</Text><Text style={styles.counter}>{activeIndex + 1} / {radios.length}</Text></View>
        <Pressable onPress={() => requestChange(1)} accessibilityRole="button" accessibilityLabel="Emisora siguiente" style={({ pressed }) => [styles.arrow, pressed && styles.pressed]}><IconSymbol name="chevron.right" size={20} color="#F5F3EE" /></Pressable>
      </View>
      <View style={styles.dots} accessibilityElementsHidden><View style={[styles.dot, styles.dotActive]} /><View style={styles.dot} /><View style={styles.dot} /></View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { height: 410, borderRadius: 0, overflow: "hidden", backgroundColor: "#090A10", borderWidth: 1, borderColor: "#29202F", marginBottom: 28, paddingTop: 4 },
  rootLight: { backgroundColor: "#090A10", borderColor: "#29202F" },
  stage: { height: 302, alignItems: "center", justifyContent: "center", position: "relative", overflow: "visible" },
  sideSlot: { position: "absolute", top: 36, width: 128, height: 222, zIndex: 1, alignItems: "center" },
  sideLeft: { left: 6 },
  sideRight: { right: 6 },
  centerSlot: { width: 218, height: 250, zIndex: 3, alignItems: "center" },
  outerGlow: { position: "absolute", width: 246, height: 246, borderRadius: 28, shadowColor: "#FF5E67", shadowOpacity: 0.9, shadowRadius: 30, shadowOffset: { width: 0, height: 0 }, elevation: 14 },
  cover: { overflow: "hidden", borderWidth: 1, borderColor: "#FFFFFF45", alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.62, shadowRadius: 24, shadowOffset: { width: 0, height: 16 }, elevation: 10 },
  sideCover: { width: 128, height: 210, borderRadius: 12 },
  centerCover: { width: 218, height: 232, borderRadius: 18, shadowRadius: 30, shadowOpacity: 0.78 },
  centerPressable: { width: "100%", height: "100%", alignItems: "center", justifyContent: "center" },
  bufferingOverlay: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center", backgroundColor: "#08090EB8", gap: 8 },
  bufferingText: { color: "#F5F3EE", fontSize: 11, fontWeight: "700", letterSpacing: 0.4 },
  innerGlow: { ...StyleSheet.absoluteFillObject, borderRadius: 4 },
  sideShade: { ...StyleSheet.absoluteFillObject, backgroundColor: "#00000038" },
  centerGloss: { position: "absolute", top: 9, left: 14, right: 14, height: 52, backgroundColor: "#FFFFFF12" },
  diagonalSheen: { position: "absolute", width: 280, height: 34, top: 74, left: -36, backgroundColor: "#FFFFFF18", transform: [{ rotate: "-28deg" }] },
  reflection: { position: "absolute", top: 212, width: 128, height: 36, opacity: 0.1, transform: [{ scaleY: -1 }], overflow: "hidden" },
  centerReflection: { width: 218, height: 42, opacity: 0.08, transform: [{ scaleY: -1 }], overflow: "hidden" },
  captionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, marginTop: 4 },
  caption: { flex: 1, alignItems: "center", paddingHorizontal: 12 },
  stationName: { color: "#F5F3EE", fontSize: 22, fontWeight: "700", letterSpacing: -0.4 },
  stationNameLight: { color: "#F5F3EE" },
  stationMeta: { color: "#B7C0D0", fontSize: 12, marginTop: 5 },
  stationMetaLight: { color: "#B7C0D0" },
  counter: { color: "#FF6B5A", fontSize: 10, fontWeight: "700", marginTop: 6 },
  arrow: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#FFFFFF14", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#FFFFFF1C" },
  pressed: { opacity: 0.62, transform: [{ scale: 0.93 }] },
  dots: { flexDirection: "row", justifyContent: "center", gap: 5, marginTop: 9 },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: "#687184" },
  dotActive: { width: 18, backgroundColor: "#FF6B5A" },
});
