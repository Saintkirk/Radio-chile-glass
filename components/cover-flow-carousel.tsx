import { useEffect, useMemo, useRef, useState } from "react";
import { AccessibilityInfo, PanResponder, Pressable, StyleSheet, Text, View } from "react-native";
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
  runOnJS,
  type SharedValue,
} from "react-native-reanimated";

import { StationLogo } from "@/components/station-logo";
import { IconSymbol } from "@/components/ui/icon-symbol";
import type { Radio } from "@/lib/radio-player";

type Side = -1 | 0 | 1;

const EQUALIZER_VALUES = [
  [0.32, 0.86, 0.46, 0.72, 0.32],
  [0.48, 0.98, 0.36, 0.76, 0.48],
  [0.38, 0.72, 0.98, 0.52, 0.38],
  [0.62, 0.34, 0.82, 0.98, 0.62],
] as const;

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

function useEqualizerBarStyle(equalizer: SharedValue<number>, index: number, reduceMotion: boolean) {
  return useAnimatedStyle(() => {
    if (reduceMotion) return { transform: [{ scaleY: 0.62 }] };
    const values = EQUALIZER_VALUES[index];
    return { transform: [{ scaleY: interpolate(equalizer.get(), [0, 0.25, 0.5, 0.75, 1], values, Extrapolation.CLAMP) }] };
  }, [equalizer, index, reduceMotion]);
}

export function CoverFlowCarousel({ radios, activeIndex, onChange, onPlay, isPlaying, isLoading, currentRadioId, lightMode = false }: { radios: Radio[]; activeIndex: number; onChange: (direction: number) => void; onPlay: () => void; isPlaying: boolean; isLoading: boolean; currentRadioId?: string; lightMode?: boolean }) {
  const motion = useSharedValue(1);
  const dragX = useSharedValue(0);
  const glow = useSharedValue(0);
  const equalizer = useSharedValue(0);
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
  const stageDragStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: dragX.get() }],
  }), [dragX]);
  const equalizerStyles = [
    useEqualizerBarStyle(equalizer, 0, reduceMotion),
    useEqualizerBarStyle(equalizer, 1, reduceMotion),
    useEqualizerBarStyle(equalizer, 2, reduceMotion),
    useEqualizerBarStyle(equalizer, 3, reduceMotion),
  ];

  useEffect(() => {
    cancelAnimation(motion);
    cancelAnimation(dragX);
    dragX.set(0);
    if (reduceMotion) {
      motion.set(1);
      return undefined;
    }
    motion.set(0);
    motion.set(withTiming(1, { duration: 300, easing: Easing.bezier(0.22, 1, 0.36, 1) }));
    return undefined;
  }, [activeIndex, dragX, motion, reduceMotion]);

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
    cancelAnimation(equalizer);
    if (!isLoading || reduceMotion) {
      equalizer.set(0);
      return undefined;
    }
    equalizer.set(withRepeat(withSequence(
      withTiming(1, { duration: 620, easing: Easing.inOut(Easing.ease) }),
      withTiming(0, { duration: 620, easing: Easing.inOut(Easing.ease) }),
    ), -1, false));
    return () => cancelAnimation(equalizer);
  }, [equalizer, isLoading, reduceMotion]);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion).catch(() => undefined);
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotion);
    return () => subscription.remove();
  }, []);

  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > Math.abs(gesture.dy) && Math.abs(gesture.dx) > 8,
    onPanResponderGrant: () => {
      cancelAnimation(dragX);
    },
    onPanResponderMove: (_, gesture) => {
      if (reduceMotion) return;
      const resistance = Math.max(-84, Math.min(84, gesture.dx * 0.34));
      dragX.set(resistance);
    },
    onPanResponderRelease: (_, gesture) => {
      const validSwipe = Math.abs(gesture.dx) >= 48 && Math.abs(gesture.dx) >= Math.abs(gesture.dy) * 1.15;
      if (!validSwipe || reduceMotion) {
        dragX.set(withTiming(0, { duration: 180, easing: Easing.out(Easing.cubic) }));
        return;
      }
      const nextDirection = gesture.dx < 0 ? 1 : -1;
      directionRef.current = nextDirection;
      direction.set(nextDirection);
      dragX.set(withTiming(gesture.dx < 0 ? -118 : 118, { duration: 145, easing: Easing.bezier(0.22, 1, 0.36, 1) }, (finished) => {
        if (!finished) return;
        dragX.set(0);
        runOnJS(onChange)(nextDirection);
      }));
    },
  }), [direction, dragX, onChange, reduceMotion]);

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
        <StationLogo radio={radio} size={122} radius={22} />
        <View style={styles.sideShade} />
      </Animated.View>
      <View style={styles.reflection}><StationLogo radio={radio} size={122} radius={22} /></View>
    </Pressable>
  ) : null;

  return (
    <View {...panResponder.panHandlers} style={[styles.root, lightMode && styles.rootLight]} accessibilityLabel="Carrusel de emisoras">
      <Animated.View style={[styles.stage, stageDragStyle]}>
        {sideCard(previous, -1, previousStyle)}
        <Animated.View style={[styles.centerSlot, centerStyle]}>
          <Animated.View pointerEvents="none" style={[styles.outerGlow, glowStyle, { backgroundColor: active.accent }]} />
          <View style={[styles.centerCover, { backgroundColor: `${active.accent}40` }]}>
            <Animated.View pointerEvents="none" style={[styles.innerGlow, innerGlowStyle, { backgroundColor: active.accent }]} />
            <Pressable disabled={isLoading} onPress={onPlay} accessibilityRole="button" accessibilityLabel={isLoading ? `Conectando con ${active.name}` : currentRadioId === active.id && isPlaying ? `Pausar ${active.name}` : `Reproducir ${active.name}`} style={styles.centerPressable}>
              <StationLogo radio={active} size={214} radius={30} />
              <View pointerEvents="none" style={[styles.liveBadge, { borderColor: `${active.accent}CC`, backgroundColor: `${active.accent}DD` }]}><IconSymbol name="waveform" size={15} color="#FFFFFF" /><Text style={styles.liveBadgeText}>EN VIVO</Text></View>
              {isLoading && <View pointerEvents="none" style={styles.bufferingOverlay} accessible accessibilityLabel={`Almacenando en búfer ${active.name}`}>
                <View style={styles.equalizer}>
                  {equalizerStyles.map((animatedStyle, index) => <Animated.View key={index} style={[styles.equalizerBar, { backgroundColor: active.accent }, animatedStyle]} />)}
                </View>
                <Text style={styles.bufferingText}>Conectando…</Text>
              </View>}
              <View pointerEvents="none" style={styles.diagonalSheen} />
              <View pointerEvents="none" style={styles.centerGloss} />
            </Pressable>
          </View>
          <View style={styles.centerReflection}><StationLogo radio={active} size={184} radius={27} /></View>
        </Animated.View>
        {sideCard(next, 1, nextStyle)}
      </Animated.View>
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
  root: { height: 454, borderRadius: 0, overflow: "visible", backgroundColor: "transparent", borderWidth: 0, marginBottom: 24, paddingTop: 10 },
  rootLight: { backgroundColor: "transparent", borderColor: "transparent" },
  stage: { height: 334, alignItems: "center", justifyContent: "center", position: "relative", overflow: "visible" },
  sideSlot: { position: "absolute", top: 34, width: 136, height: 250, zIndex: 1, alignItems: "center" },
  sideLeft: { left: -2 },
  sideRight: { right: -2 },
  centerSlot: { width: 238, height: 310, zIndex: 3, alignItems: "center" },
  outerGlow: { position: "absolute", width: 264, height: 316, borderRadius: 32, shadowColor: "#FF5E67", shadowOpacity: 0.9, shadowRadius: 34, shadowOffset: { width: 0, height: 0 }, elevation: 16 },
  cover: { overflow: "hidden", borderWidth: 1, borderColor: "#FFFFFF52", alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.7, shadowRadius: 26, shadowOffset: { width: 0, height: 16 }, elevation: 12 },
  sideCover: { width: 136, height: 246, borderRadius: 18 },
  centerCover: { width: 238, height: 300, borderRadius: 28, shadowRadius: 34, shadowOpacity: 0.84 },
  centerPressable: { width: "100%", height: "100%", alignItems: "center", justifyContent: "center" },
  bufferingOverlay: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center", backgroundColor: "#08090EB8", gap: 10 },
  equalizer: { height: 42, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5 },
  equalizerBar: { width: 6, height: 34, borderRadius: 3, shadowColor: "#FFFFFF", shadowOpacity: 0.35, shadowRadius: 6, shadowOffset: { width: 0, height: 0 }, elevation: 4 },
  bufferingText: { color: "#F5F3EE", fontSize: 11, fontWeight: "700", letterSpacing: 0.4 },
  liveBadge: { position: "absolute", bottom: 24, left: 46, right: 46, height: 34, borderRadius: 17, borderWidth: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, shadowColor: "#FF5E67", shadowOpacity: 0.55, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 7 }, liveBadgeText: { color: "#FFFFFF", fontSize: 11, fontWeight: "800", letterSpacing: 1.4 },
  innerGlow: { ...StyleSheet.absoluteFillObject, borderRadius: 4 },
  sideShade: { ...StyleSheet.absoluteFillObject, backgroundColor: "#00000038" },
  centerGloss: { position: "absolute", top: 9, left: 14, right: 14, height: 52, backgroundColor: "#FFFFFF12" },
  diagonalSheen: { position: "absolute", width: 280, height: 34, top: 74, left: -36, backgroundColor: "#FFFFFF18", transform: [{ rotate: "-28deg" }] },
  reflection: { position: "absolute", top: 246, width: 136, height: 42, opacity: 0.12, transform: [{ scaleY: -1 }], overflow: "hidden" },
  centerReflection: { width: 238, height: 52, opacity: 0.11, transform: [{ scaleY: -1 }], overflow: "hidden" },
  captionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, marginTop: 4 },
  caption: { flex: 1, alignItems: "center", paddingHorizontal: 12 },
  stationName: { color: "#F5F3EE", fontSize: 24, fontWeight: "700", letterSpacing: -0.5 },
  stationNameLight: { color: "#F5F3EE" },
  stationMeta: { color: "#B7C0D0", fontSize: 12, marginTop: 5 },
  stationMetaLight: { color: "#B7C0D0" },
  counter: { color: "#FF6B5A", fontSize: 10, fontWeight: "700", marginTop: 6 },
  arrow: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#FFFFFF14", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#FFFFFF1C" },
  pressed: { opacity: 0.62, transform: [{ scale: 0.93 }] },
  dots: { flexDirection: "row", justifyContent: "center", gap: 7, marginTop: 10 },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: "#687184" },
  dotActive: { width: 18, backgroundColor: "#FF6B5A" },
});
