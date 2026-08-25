import { useCallback, useEffect, useMemo, useState } from "react";
import { AccessibilityInfo, Pressable, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withDecay,
  cancelAnimation,
  runOnJS,
  type SharedValue,
} from "react-native-reanimated";

import { StationLogo } from "@/components/station-logo";
import { IconSymbol } from "@/components/ui/icon-symbol";
import type { Radio } from "@/lib/radio-player";
import { horizontalSwipeDirection } from "@/lib/player-utils";

type Side = -1 | 0 | 1;
type OuterSide = -2 | 2;

const EQUALIZER_VALUES = [
  [0.32, 0.86, 0.46, 0.72, 0.32],
  [0.48, 0.98, 0.36, 0.76, 0.48],
  [0.38, 0.72, 0.98, 0.52, 0.38],
  [0.62, 0.34, 0.82, 0.98, 0.62],
] as const;

const DRAG_LIMIT = 156;
const SWIPE_DISTANCE = 34;
const SWIPE_VELOCITY = 300;
const SWIPE_EXIT_DISTANCE = 196;
const MAX_GESTURE_VELOCITY = 2200;

function useCardAnimatedStyle(side: Side, motion: SharedValue<number>, direction: SharedValue<number>, dragX: SharedValue<number>, reduceMotion: boolean) {
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
    const drag = dragX.get();
    const dragProgress = Math.max(-1, Math.min(1, drag / DRAG_LIMIT));
    const dragStrength = Math.abs(dragProgress);
    const incoming = side !== 0 && side * dragProgress < 0;
    const settledX = interpolate(progress, [0, 1], [startX, endX], Extrapolation.CLAMP);
    const settledRotation = interpolate(progress, [0, 1], [startRotation, targetRotation], Extrapolation.CLAMP);
    const settledScale = side === 0
      ? interpolate(progress, [0, 0.72, 1], [0.84, 0.96, 1], Extrapolation.CLAMP)
      : interpolate(progress, [0, 1], [0.68, 0.82], Extrapolation.CLAMP);

    return {
      opacity: side === 0
        ? interpolate(progress, [0, 0.7, 1], [0.35, 0.8, 1], Extrapolation.CLAMP) - dragStrength * 0.38
        : interpolate(progress, [0, 1], [0.35, 0.85], Extrapolation.CLAMP) + (incoming ? dragStrength * 0.23 : -dragStrength * 0.14),
      transform: [
        { perspective: 900 },
        { translateX: settledX + (side === 0 ? dragProgress * 164 : incoming ? dragProgress * 144 : dragProgress * 26) },
        { translateY: interpolate(progress, [0, 1], side === 0 ? [8, 0] : [12, 4], Extrapolation.CLAMP) + (side === 0 ? dragStrength * 8 : -dragStrength * 4) },
        { scale: settledScale + (side === 0 ? -dragStrength * 0.18 : incoming ? dragStrength * 0.2 : -dragStrength * 0.07) },
        { rotateY: `${settledRotation + (side === 0 ? dragProgress * 38 : incoming ? -dragProgress * 34 : dragProgress * 9)}deg` },
      ],
    };
  }, [direction, dragX, motion, reduceMotion, side]);
}

function useOuterCardAnimatedStyle(side: OuterSide, motion: SharedValue<number>, dragX: SharedValue<number>, reduceMotion: boolean) {
  return useAnimatedStyle(() => {
    if (reduceMotion) {
      return {
        opacity: 0.42,
        transform: [{ perspective: 900 }, { scale: 0.58 }, { rotateY: side < 0 ? "56deg" : "-56deg" }],
      };
    }

    const progress = motion.get();
    const dragProgress = Math.max(-1, Math.min(1, dragX.get() / DRAG_LIMIT));
    const dragStrength = Math.abs(dragProgress);
    const incoming = side * dragProgress < 0;
    const baseRotation = side < 0 ? 62 : -62;
    const baseShift = side < 0 ? -10 : 10;

    return {
      opacity: interpolate(progress, [0, 1], [0.08, 0.38], Extrapolation.CLAMP) + (incoming ? dragStrength * 0.2 : -dragStrength * 0.08),
      transform: [
        { perspective: 900 },
        { translateX: baseShift + dragProgress * (incoming ? 54 : 12) },
        { translateY: 28 - dragStrength * 8 },
        { scale: interpolate(progress, [0, 1], [0.44, 0.58], Extrapolation.CLAMP) + (incoming ? dragStrength * 0.1 : -dragStrength * 0.04) },
        { rotateY: `${baseRotation - dragProgress * 20}deg` },
      ],
    };
  }, [dragX, motion, reduceMotion, side]);
}

function useEqualizerBarStyle(equalizer: SharedValue<number>, index: number, reduceMotion: boolean) {
  return useAnimatedStyle(() => {
    if (reduceMotion) return { transform: [{ scaleY: 0.62 }] };
    const values = EQUALIZER_VALUES[index];
    return { transform: [{ scaleY: interpolate(equalizer.get(), [0, 0.25, 0.5, 0.75, 1], values, Extrapolation.CLAMP) }] };
  }, [equalizer, index, reduceMotion]);
}

export function CoverFlowCarousel({ radios, activeIndex, onSelect, onPlay, isPlaying, isLoading, currentRadioId, lightMode = false }: { radios: Radio[]; activeIndex: number; onSelect: (radio: Radio) => void; onPlay: () => void; isPlaying: boolean; isLoading: boolean; currentRadioId?: string; lightMode?: boolean }) {
  const motion = useSharedValue(1);
  const dragX = useSharedValue(0);
  const glow = useSharedValue(0);
  const equalizer = useSharedValue(0);
  const direction = useSharedValue(1);
  const isTransitioning = useSharedValue(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const active = radios[activeIndex];
  const previous = radios.length ? radios[(activeIndex - 1 + radios.length) % radios.length] : undefined;
  const next = radios.length ? radios[(activeIndex + 1) % radios.length] : undefined;
  const farPrevious = radios.length > 3 ? radios[(activeIndex - 2 + radios.length) % radios.length] : undefined;
  const farNext = radios.length > 3 ? radios[(activeIndex + 2) % radios.length] : undefined;
  const centerStyle = useCardAnimatedStyle(0, motion, direction, dragX, reduceMotion);
  const previousStyle = useCardAnimatedStyle(-1, motion, direction, dragX, reduceMotion);
  const nextStyle = useCardAnimatedStyle(1, motion, direction, dragX, reduceMotion);
  const farPreviousStyle = useOuterCardAnimatedStyle(-2, motion, dragX, reduceMotion);
  const farNextStyle = useOuterCardAnimatedStyle(2, motion, dragX, reduceMotion);
  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(glow.get(), [0, 1], [0.12, 0.32], Extrapolation.CLAMP),
    transform: [{ scale: interpolate(glow.get(), [0, 1], [0.94, 1.08], Extrapolation.CLAMP) }],
  }), [glow]);
  const innerGlowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(glow.get(), [0, 1], [0.08, 0.18], Extrapolation.CLAMP),
  }), [glow]);
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
    motion.set(withTiming(1, { duration: 360, easing: Easing.bezier(0.16, 1, 0.3, 1) }));
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

  const requestChange = useCallback((radio: Radio | undefined, nextDirection: number) => {
    if (!radio) return;
    const normalized = nextDirection < 0 ? -1 : 1;
    direction.set(normalized);
    onSelect(radio);
  }, [direction, onSelect]);

  const commitSwipe = useCallback((nextDirection: number) => {
    requestChange(nextDirection < 0 ? previous : next, nextDirection);
  }, [next, previous, requestChange]);

  const panGesture = useMemo(() => Gesture.Pan()
    .activeOffsetX([-6, 6])
    .failOffsetY([-24, 24])
    .shouldCancelWhenOutside(false)
    .onBegin(() => {
      // Un nuevo gesto siempre puede tomar el control; esto evita una zona muerta
      // mientras la carátula anterior termina de encajar.
      cancelAnimation(dragX);
      isTransitioning.set(false);
    })
    .onUpdate((event) => {
      if (reduceMotion) return;
      const translation = event.translationX;
      const elasticDrag = translation / (1 + Math.abs(translation) / 300);
      dragX.set(Math.max(-DRAG_LIMIT, Math.min(DRAG_LIMIT, elasticDrag)));
    })
    .onEnd((event) => {
      const limitedVelocity = Math.max(-MAX_GESTURE_VELOCITY, Math.min(MAX_GESTURE_VELOCITY, event.velocityX));
      const swipeDirection = horizontalSwipeDirection(event.translationX, limitedVelocity, { distance: SWIPE_DISTANCE, velocity: SWIPE_VELOCITY });
      if (swipeDirection === 0) {
        dragX.set(withTiming(0, { duration: 150, easing: Easing.bezier(0.2, 0.85, 0.28, 1) }));
        return;
      }
      direction.set(swipeDirection);
      if (reduceMotion) {
        runOnJS(commitSwipe)(swipeDirection);
        return;
      }
      isTransitioning.set(true);
      const exitTarget = swipeDirection > 0 ? -SWIPE_EXIT_DISTANCE : SWIPE_EXIT_DISTANCE;
      const finalSnapDuration = Math.max(90, Math.min(150, 150 - Math.abs(limitedVelocity) / 30));
      const inertiaThenSnap = withSequence(
        withDecay({ velocity: limitedVelocity, deceleration: 0.99, clamp: [-SWIPE_EXIT_DISTANCE, SWIPE_EXIT_DISTANCE] }),
        withTiming(exitTarget, { duration: finalSnapDuration, easing: Easing.bezier(0.18, 0.9, 0.26, 1) }, (finished) => {
          isTransitioning.set(false);
          if (!finished) return;
          dragX.set(0);
          runOnJS(commitSwipe)(swipeDirection);
        })
      );
      dragX.set(inertiaThenSnap);
    }), [commitSwipe, direction, dragX, isTransitioning, reduceMotion]);

  const sideCard = (radio: Radio | undefined, side: -1 | 1, animatedStyle: ReturnType<typeof useCardAnimatedStyle>) => radio ? (
    <Pressable onPress={() => requestChange(radio, side)} accessibilityRole="button" accessibilityLabel={`Ir a ${radio.name}`} style={[styles.sideSlot, side === -1 ? styles.sideLeft : styles.sideRight]}>
      <Animated.View pointerEvents="none" style={[styles.sideContactShadow, animatedStyle]} />
      <Animated.View style={[styles.cover, styles.sideCover, animatedStyle, { backgroundColor: `${radio.accent}32` }]}>
        <StationLogo radio={radio} size={122} radius={22} />
        <View style={styles.sideShade} />
      </Animated.View>
      <Animated.View pointerEvents="none" style={[styles.reflection, animatedStyle]}>
        <StationLogo radio={radio} size={122} radius={22} />
        <View style={styles.reflectionFadeStrong} />
        <View style={styles.reflectionFadeSoft} />
      </Animated.View>
    </Pressable>
  ) : null;

  const outerCard = (radio: Radio | undefined, side: OuterSide, animatedStyle: ReturnType<typeof useOuterCardAnimatedStyle>) => radio ? (
    <Pressable onPress={() => requestChange(radio, side)} accessibilityRole="button" accessibilityLabel={`Ir a ${radio.name}`} style={[styles.outerSlot, side < 0 ? styles.outerLeft : styles.outerRight]}>
      <Animated.View pointerEvents="none" style={[styles.outerContactShadow, animatedStyle]} />
      <Animated.View style={[styles.cover, styles.outerCover, animatedStyle, { backgroundColor: `${radio.accent}2A` }]}>
        <StationLogo radio={radio} size={100} radius={17} />
        <View style={styles.outerShade} />
      </Animated.View>
      <Animated.View pointerEvents="none" style={[styles.outerReflection, animatedStyle]}>
        <StationLogo radio={radio} size={92} radius={16} />
        <View style={styles.reflectionFadeStrong} />
        <View style={styles.reflectionFadeSoft} />
      </Animated.View>
    </Pressable>
  ) : null;

  if (!active) return null;

  return (
    <GestureDetector gesture={panGesture}>
    <View style={[styles.root, lightMode && styles.rootLight]} accessibilityLabel="Carrusel de emisoras">
      <View style={styles.stage}>
        {outerCard(farPrevious, -2, farPreviousStyle)}
        {sideCard(previous, -1, previousStyle)}
        <Animated.View style={[styles.centerSlot, centerStyle]}>
          <View pointerEvents="none" style={styles.centerContactShadow} />
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
          <View pointerEvents="none" style={styles.centerReflection}>
            <StationLogo radio={active} size={184} radius={27} />
            <View style={styles.reflectionFadeStrong} />
            <View style={styles.reflectionFadeSoft} />
          </View>
        </Animated.View>
        {sideCard(next, 1, nextStyle)}
        {outerCard(farNext, 2, farNextStyle)}
      </View>
      <View style={styles.captionRow}>
        <Pressable onPress={() => requestChange(previous, -1)} accessibilityRole="button" accessibilityLabel="Emisora anterior" style={({ pressed }) => [styles.arrow, pressed && styles.pressed]}><IconSymbol name="chevron.left" size={20} color="#F5F3EE" /></Pressable>
        <View style={styles.caption}><Text style={[styles.stationName, lightMode && styles.stationNameLight]} numberOfLines={1}>{active.name}</Text><Text style={[styles.stationMeta, lightMode && styles.stationMetaLight]}>{active.frequency}  ·  {active.genre}</Text><Text style={styles.counter}>{activeIndex + 1} / {radios.length}</Text></View>
        <Pressable onPress={() => requestChange(next, 1)} accessibilityRole="button" accessibilityLabel="Emisora siguiente" style={({ pressed }) => [styles.arrow, pressed && styles.pressed]}><IconSymbol name="chevron.right" size={20} color="#F5F3EE" /></Pressable>
      </View>
      <View style={styles.dots} accessibilityElementsHidden><View style={[styles.dot, styles.dotActive]} /><View style={styles.dot} /><View style={styles.dot} /></View>
    </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  root: { height: 556, borderRadius: 0, overflow: "visible", backgroundColor: "transparent", borderWidth: 0, marginBottom: 24, paddingTop: 10 },
  rootLight: { backgroundColor: "transparent", borderColor: "transparent" },
  stage: { height: 414, alignItems: "center", justifyContent: "center", position: "relative", overflow: "visible" },
  outerSlot: { position: "absolute", top: 86, width: 112, height: 238, zIndex: 0, alignItems: "center" },
  outerLeft: { left: -64 },
  outerRight: { right: -64 },
  sideSlot: { position: "absolute", top: 46, width: 150, height: 316, zIndex: 1, alignItems: "center" },
  sideLeft: { left: -2 },
  sideRight: { right: -2 },
  centerSlot: { width: 270, height: 392, zIndex: 3, alignItems: "center", position: "relative" },
  centerContactShadow: { position: "absolute", top: 374, width: 204, height: 16, borderRadius: 999, backgroundColor: "#05060B", opacity: 0.34, transform: [{ scaleY: 0.2 }] },
  outerGlow: { position: "absolute", width: 292, height: 402, borderRadius: 32, shadowColor: "#FF5E67", shadowOpacity: 0.9, shadowRadius: 34, shadowOffset: { width: 0, height: 0 }, elevation: 16 },
  cover: { overflow: "hidden", borderWidth: 1, borderColor: "#FFFFFF52", alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.7, shadowRadius: 26, shadowOffset: { width: 0, height: 16 }, elevation: 12 },
  outerCover: { width: 112, height: 228, borderRadius: 18, borderColor: "#FFFFFF32", shadowOpacity: 0.38, shadowRadius: 12, shadowOffset: { width: 0, height: 9 }, elevation: 3 },
  outerContactShadow: { position: "absolute", top: 218, width: 84, height: 14, borderRadius: 999, backgroundColor: "#05060B", opacity: 0.28, transform: [{ scaleY: 0.2 }] },
  outerReflection: { position: "absolute", top: 226, width: 106, height: 34, opacity: 0.07, transform: [{ scaleY: -1 }], overflow: "hidden", borderRadius: 16, alignItems: "center" },
  sideCover: { width: 150, height: 308, borderRadius: 24 },
  sideContactShadow: { position: "absolute", top: 300, width: 112, height: 18, borderRadius: 999, backgroundColor: "#05060B", opacity: 0.3, transform: [{ scaleY: 0.2 }] },
  centerCover: { width: 270, height: 382, borderRadius: 34, borderWidth: 2, borderColor: "#FFFFFFB8", shadowRadius: 38, shadowOpacity: 0.92 },
  centerPressable: { width: "100%", height: "100%", alignItems: "center", justifyContent: "center" },
  bufferingOverlay: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center", backgroundColor: "#08090EB8", gap: 10 },
  equalizer: { height: 42, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5 },
  equalizerBar: { width: 6, height: 34, borderRadius: 3, shadowColor: "#FFFFFF", shadowOpacity: 0.35, shadowRadius: 6, shadowOffset: { width: 0, height: 0 }, elevation: 4 },
  bufferingText: { color: "#F5F3EE", fontSize: 11, fontWeight: "700", letterSpacing: 0.4 },
  liveBadge: { position: "absolute", bottom: 24, left: 46, right: 46, height: 34, borderRadius: 17, borderWidth: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, shadowColor: "#FF5E67", shadowOpacity: 0.55, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 7 }, liveBadgeText: { color: "#FFFFFF", fontSize: 11, fontWeight: "800", letterSpacing: 1.4 },
  innerGlow: { ...StyleSheet.absoluteFillObject, borderRadius: 4 },
  sideShade: { ...StyleSheet.absoluteFillObject, backgroundColor: "#00000038" },
  outerShade: { ...StyleSheet.absoluteFillObject, backgroundColor: "#05060B66" },
  centerGloss: { position: "absolute", top: 9, left: 14, right: 14, height: 52, backgroundColor: "#FFFFFF12" },
  diagonalSheen: { position: "absolute", width: 280, height: 34, top: 74, left: -36, backgroundColor: "#FFFFFF18", transform: [{ rotate: "-28deg" }] },
  reflection: { position: "absolute", top: 307, width: 150, height: 52, opacity: 0.08, transform: [{ scaleY: -1 }], overflow: "hidden", borderRadius: 20, alignItems: "center" },
  centerReflection: { position: "absolute", top: 382, width: 270, height: 52, opacity: 0.08, transform: [{ scaleY: -1 }], overflow: "hidden", borderRadius: 28, alignItems: "center" },
  reflectionFadeStrong: { position: "absolute", left: 0, right: 0, top: 0, height: 12, backgroundColor: "#070811", opacity: 0.2 },
  reflectionFadeSoft: { position: "absolute", left: 0, right: 0, bottom: 0, height: 24, backgroundColor: "#070811", opacity: 0.48 },
  captionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, marginTop: 8 },
  caption: { flex: 1, alignItems: "center", paddingHorizontal: 12 },
  stationName: { color: "#F5F3EE", fontSize: 26, fontWeight: "700", letterSpacing: -0.5 },
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
