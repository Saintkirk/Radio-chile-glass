import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { AccessibilityInfo, Pressable, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDecay,
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
import { safeRadioIndex } from "@/lib/player-utils";
import { nonInteractiveStyle, platformShadow } from "@/lib/platform-styles";

type OuterSide = -2 | 2;

const EQUALIZER_VALUES = [
  [0.32, 0.86, 0.46, 0.72, 0.32],
  [0.48, 0.98, 0.36, 0.76, 0.48],
  [0.38, 0.72, 0.98, 0.52, 0.38],
  [0.62, 0.34, 0.82, 0.98, 0.62],
] as const;

const FLOW_STEP = 116;
const COVER_SIZE = 214;
const BARREL_RADIUS = COVER_SIZE * 1.1;
const BARREL_ANGLE_STEP = (40 * Math.PI) / 180;
const BARREL_MAX_ANGLE = (82 * Math.PI) / 180;
const BARREL_VERTICAL_RADIUS = 18;
const DRAG_LIMIT = 156;
const SWIPE_DISTANCE = 26;
const SWIPE_VELOCITY = 300;
const MAX_GESTURE_VELOCITY = 2200;
const INERTIA_VELOCITY_FACTOR = 0.14;
const INERTIA_DECELERATION = 0.84;
const INERTIA_MIN_OFFSET = FLOW_STEP * 0.58;
const INERTIA_MAX_OFFSET = FLOW_STEP * 1.55;

type FlowSlot = -2 | -1 | 0 | 1 | 2;

function useFlowCardAnimatedStyle(slot: FlowSlot, dragX: SharedValue<number>, reduceMotion: boolean) {
  return useAnimatedStyle(() => {
    // Each card travels on the surface of an invisible horizontal drum. A
    // fractional slot changes its angle, x-position, height and scale together,
    // making the selected cover feel like it is rotating through a cylinder.
    const normalized = slot + dragX.get() / FLOW_STEP;
    const angle = Math.max(-BARREL_MAX_ANGLE, Math.min(BARREL_MAX_ANGLE, normalized * BARREL_ANGLE_STEP));
    const depth = Math.max(0.12, Math.cos(angle));
    const distance = Math.min(2.6, Math.abs(normalized));
    const visualX = Math.sin(angle) * BARREL_RADIUS;
    const visualY = (1 - depth) * BARREL_VERTICAL_RADIUS;
    const rotation = `${-angle * 57.2958}deg`;
    const scale = Math.max(0.75, depth);
    const opacity = Math.max(0.2, depth);

    if (reduceMotion) {
      return {
        opacity,
        zIndex: Math.round(58 + depth * 42),
        transform: [
          { perspective: 900 },
          { translateX: visualX },
          { translateY: visualY },
          { rotateY: rotation },
          { scale },
        ],
      };
    }

    return {
      opacity: interpolate(distance, [0, 1, 2, 2.6], [1, 0.78, 0.22, 0.2], Extrapolation.CLAMP),
      zIndex: Math.round(58 + depth * 42),
      transform: [
        { perspective: 900 },
        { translateX: visualX },
        { translateY: visualY },
        { rotateY: rotation },
        { scale },
      ],
    };
  }, [dragX, reduceMotion, slot]);
}

function useEqualizerBarStyle(equalizer: SharedValue<number>, index: number, reduceMotion: boolean) {
  return useAnimatedStyle(() => {
    if (reduceMotion) return { transform: [{ scaleY: 0.62 }] };
    const values = EQUALIZER_VALUES[index];
    return { transform: [{ scaleY: interpolate(equalizer.get(), [0, 0.25, 0.5, 0.75, 1], values, Extrapolation.CLAMP) }] };
  }, [equalizer, index, reduceMotion]);
}

export function CoverFlowCarousel({ radios, activeIndex, onSelect, onPlay, isPlaying, isLoading, currentRadioId, lightMode = false }: { radios: Radio[]; activeIndex: number; onSelect: (radio: Radio) => void; onPlay: () => void; isPlaying: boolean; isLoading: boolean; currentRadioId?: string; lightMode?: boolean }) {
  const dragX = useSharedValue(0);
  const glow = useSharedValue(0);
  const equalizer = useSharedValue(0);
  const isSettling = useSharedValue(false);
  const isMounted = useSharedValue(true);
  const [reduceMotion, setReduceMotion] = useState(false);
  const safeActiveIndex = safeRadioIndex(radios.length, activeIndex);
  const active = safeActiveIndex >= 0 ? radios[safeActiveIndex] : undefined;
  const previous = safeActiveIndex >= 0 ? radios[(safeActiveIndex - 1 + radios.length) % radios.length] : undefined;
  const next = safeActiveIndex >= 0 ? radios[(safeActiveIndex + 1) % radios.length] : undefined;
  const farPrevious = safeActiveIndex >= 0 && radios.length > 3 ? radios[(safeActiveIndex - 2 + radios.length) % radios.length] : undefined;
  const farNext = safeActiveIndex >= 0 && radios.length > 3 ? radios[(safeActiveIndex + 2) % radios.length] : undefined;
  const centerStyle = useFlowCardAnimatedStyle(0, dragX, reduceMotion);
  const previousStyle = useFlowCardAnimatedStyle(-1, dragX, reduceMotion);
  const nextStyle = useFlowCardAnimatedStyle(1, dragX, reduceMotion);
  const farPreviousStyle = useFlowCardAnimatedStyle(-2, dragX, reduceMotion);
  const farNextStyle = useFlowCardAnimatedStyle(2, dragX, reduceMotion);
  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(glow.get(), [0, 1], [0.04, 0.13], Extrapolation.CLAMP),
    transform: [{ scale: interpolate(glow.get(), [0, 1], [0.98, 1.03], Extrapolation.CLAMP) }],
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
    isMounted.set(true);
    return () => {
      isMounted.set(false);
      isSettling.set(false);
      cancelAnimation(dragX);
      cancelAnimation(glow);
      cancelAnimation(equalizer);
    };
  }, [dragX, equalizer, glow, isMounted, isSettling]);

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
    if (reduceMotion) {
      dragX.set(0);
      onSelect(radio);
      return;
    }
    cancelAnimation(dragX);
    isSettling.set(true);
    const targetOffset = -nextDirection * FLOW_STEP;
    dragX.set(withTiming(targetOffset, {
      duration: 230,
      easing: Easing.bezier(0.18, 0.82, 0.22, 1),
    }, (finished) => {
      isSettling.set(false);
      if (!finished || !isMounted.get()) return;
      runOnJS(onSelect)(radio);
    }));
  }, [dragX, isMounted, isSettling, onSelect, reduceMotion]);

  const commitSwipeFromGesture = useCallback((nextDirection: number) => {
    const target = nextDirection < 0 ? previous : next;
    if (!target || !active || target.id === active.id) return;
    onSelect(target);
  }, [active, next, onSelect, previous]);

  useLayoutEffect(() => {
    // Rebase the shared offset only after React has rendered the new active
    // radio. The outgoing cover finishes its barrel arc first, then the new
    // active cover is centered before the next frame is painted.
    cancelAnimation(dragX);
    dragX.set(0);
    isSettling.set(false);
  }, [active?.id, activeIndex, dragX, isSettling]);

  const panGesture = useMemo(() => Gesture.Pan()
    .activeOffsetX([-3, 3])
    .failOffsetY([-18, 18])
    .shouldCancelWhenOutside(false)
    .onBegin(() => {
      if (!isMounted.get()) return;
      // Un nuevo gesto siempre puede tomar el control; esto evita una zona muerta
      // mientras la carátula anterior termina de encajar.
      cancelAnimation(dragX);
      isSettling.set(false);
    })
    .onUpdate((event) => {
      if (!isMounted.get() || reduceMotion) return;
      const translation = event.translationX;
      const elasticDrag = translation / (1 + Math.abs(translation) / 300);
      dragX.set(Math.max(-DRAG_LIMIT, Math.min(DRAG_LIMIT, elasticDrag)));
    })
    .onEnd((event) => {
      if (!isMounted.get()) return;
      const limitedVelocity = Math.max(-MAX_GESTURE_VELOCITY, Math.min(MAX_GESTURE_VELOCITY, event.velocityX));
      // Keep this calculation entirely on the UI thread. Calling a regular JS
      // helper from a Reanimated worklet can terminate Android release builds.
      const projectedTranslation = event.translationX + limitedVelocity * 0.2;
      const swipeDirection = Math.abs(projectedTranslation) < SWIPE_DISTANCE && Math.abs(limitedVelocity) < SWIPE_VELOCITY
        ? 0
        : projectedTranslation < 0 ? 1 : -1;
      if (swipeDirection === 0) {
        dragX.set(withTiming(0, { duration: 150, easing: Easing.bezier(0.2, 0.85, 0.28, 1) }));
        return;
      }
      if (reduceMotion) {
        runOnJS(commitSwipeFromGesture)(swipeDirection);
        return;
      }
      isSettling.set(true);
      const settleTarget = -swipeDirection * FLOW_STEP;
      const inertiaClamp = swipeDirection > 0
        ? [-INERTIA_MAX_OFFSET, -INERTIA_MIN_OFFSET] as [number, number]
        : [INERTIA_MIN_OFFSET, INERTIA_MAX_OFFSET] as [number, number];
      const inertiaVelocity = limitedVelocity * INERTIA_VELOCITY_FACTOR;
      // Preserve the finger's release speed for a short, bounded momentum
      // burst. The second animation is the magnetic snap to one exact slot.
      dragX.set(withDecay({
        velocity: inertiaVelocity,
        deceleration: INERTIA_DECELERATION,
        clamp: inertiaClamp,
      }, (decayFinished) => {
        if (!decayFinished || !isMounted.get()) {
          isSettling.set(false);
          return;
        }
        const finalSnapDuration = Math.max(105, Math.min(180, 180 - Math.abs(limitedVelocity) / 22));
        dragX.set(withTiming(settleTarget, { duration: finalSnapDuration, easing: Easing.bezier(0.2, 0.88, 0.28, 1) }, (finished) => {
          isSettling.set(false);
          if (!finished || !isMounted.get()) return;
          runOnJS(commitSwipeFromGesture)(swipeDirection);
        }));
      }));
    })
    .onFinalize(() => {
      // A parent scroll or cancelled pan should return to center, but never
      // interrupt the settle animation that already owns the shared value.
      if (!isSettling.get()) dragX.set(withTiming(0, { duration: 120, easing: Easing.out(Easing.cubic) }));
    }), [commitSwipeFromGesture, dragX, isMounted, isSettling, reduceMotion]);

  const sideCard = (radio: Radio | undefined, side: -1 | 1, animatedStyle: ReturnType<typeof useFlowCardAnimatedStyle>) => radio ? (
    <Animated.View style={[styles.sideSlot, side === -1 ? styles.sideLeft : styles.sideRight, animatedStyle]}>
      <Pressable onPress={() => requestChange(radio, side)} accessibilityRole="button" accessibilityLabel={`Ir a ${radio.name}`} style={styles.cardPressable}>
      <View style={[styles.sideContactShadow, nonInteractiveStyle]} />
      <View style={[styles.cover, styles.sideCover, { backgroundColor: `${radio.accent}32` }]}>
        <StationLogo radio={radio} size={122} radius={22} />
        <View style={styles.sideShade} />
      </View>
      <View style={[styles.reflection, nonInteractiveStyle]}>
        <StationLogo radio={radio} size={122} radius={22} />
        <View style={styles.reflectionFadeStrong} />
        <View style={styles.reflectionFadeSoft} />
      </View>
      </Pressable>
    </Animated.View>
  ) : null;

  const outerCard = (radio: Radio | undefined, side: OuterSide, animatedStyle: ReturnType<typeof useFlowCardAnimatedStyle>) => radio ? (
    <Animated.View style={[styles.outerSlot, side < 0 ? styles.outerLeft : styles.outerRight, animatedStyle]}>
      <Pressable onPress={() => requestChange(radio, side)} accessibilityRole="button" accessibilityLabel={`Ir a ${radio.name}`} style={styles.cardPressable}>
      <View style={[styles.outerContactShadow, nonInteractiveStyle]} />
      <View style={[styles.cover, styles.outerCover, { backgroundColor: `${radio.accent}2A` }]}>
        <StationLogo radio={radio} size={100} radius={17} />
        <View style={styles.outerShade} />
      </View>
      <View style={[styles.outerReflection, nonInteractiveStyle]}>
        <StationLogo radio={radio} size={92} radius={16} />
        <View style={styles.reflectionFadeStrong} />
        <View style={styles.reflectionFadeSoft} />
      </View>
      </Pressable>
    </Animated.View>
  ) : null;

  if (!active) return null;

  return (
    <GestureDetector gesture={panGesture}>
    <View style={[styles.root, lightMode && styles.rootLight]} accessibilityLabel="Carrusel de emisoras">
      <View style={styles.stage}>
        <View style={[styles.drumTrack, nonInteractiveStyle]} />
        {outerCard(farPrevious, -2, farPreviousStyle)}
        {sideCard(previous, -1, previousStyle)}
        <Animated.View style={[styles.centerSlot, centerStyle]}>
          <View style={[styles.centerContactShadow, nonInteractiveStyle]} />
          <Animated.View style={[styles.outerGlow, glowStyle, nonInteractiveStyle]} />
          <View style={[styles.centerCover, { backgroundColor: `${active.accent}40` }]}>
            <Animated.View style={[styles.innerGlow, innerGlowStyle, { backgroundColor: active.accent }, nonInteractiveStyle]} />
            <Pressable disabled={isLoading} onPress={onPlay} accessibilityRole="button" accessibilityLabel={isLoading ? `Conectando con ${active.name}` : currentRadioId === active.id && isPlaying ? `Pausar ${active.name}` : `Reproducir ${active.name}`} style={styles.centerPressable}>
              <StationLogo radio={active} size={214} radius={30} />
              <View style={[styles.liveBadge, { borderColor: `${active.accent}CC`, backgroundColor: `${active.accent}DD` }, nonInteractiveStyle]}><IconSymbol name="waveform" size={15} color="#FFFFFF" /><Text style={styles.liveBadgeText}>EN VIVO</Text></View>
              {isLoading && <View style={[styles.bufferingOverlay, nonInteractiveStyle]} accessible accessibilityLabel={`Almacenando en búfer ${active.name}`}>
                <View style={styles.equalizer}>
                  {equalizerStyles.map((animatedStyle, index) => <Animated.View key={index} style={[styles.equalizerBar, { backgroundColor: active.accent }, animatedStyle]} />)}
                </View>
                <Text style={styles.bufferingText}>Conectando…</Text>
              </View>}
              <View style={[styles.diagonalSheen, nonInteractiveStyle]} />
              <View style={[styles.centerGloss, nonInteractiveStyle]} />
            </Pressable>
          </View>
          <View style={[styles.centerReflection, nonInteractiveStyle]}>
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
  drumTrack: { position: "absolute", width: 430, height: 224, borderRadius: 220, borderWidth: 1, borderColor: "#FFFFFF10", backgroundColor: "#FFFFFF04", opacity: 0.82, transform: [{ rotate: "-3deg" }] },
  outerSlot: { position: "absolute", top: 92, left: "50%", marginLeft: -52, width: 104, height: 220, zIndex: 0, alignItems: "center" },
  outerLeft: {},
  outerRight: {},
  sideSlot: { position: "absolute", top: 62, left: "50%", marginLeft: -68, width: 136, height: 288, zIndex: 1, alignItems: "center" },
  cardPressable: { width: "100%", height: "100%" },
  sideLeft: {},
  sideRight: {},
  centerSlot: { position: "absolute", top: 11, left: "50%", marginLeft: -135, width: 270, height: 392, zIndex: 3, alignItems: "center" },
  centerContactShadow: { position: "absolute", top: 374, width: 204, height: 16, borderRadius: 999, backgroundColor: "#05060B", opacity: 0.34, transform: [{ scaleY: 0.2 }] },
  outerGlow: { position: "absolute", width: 286, height: 394, borderRadius: 34, backgroundColor: "#FFFFFF0A", borderWidth: 1, borderColor: "#FFFFFF12", ...platformShadow({ color: "#FF5E67", opacity: 0.42, radius: 28, elevation: 10 }) },
  cover: { overflow: "hidden", borderWidth: 1, borderColor: "#FFFFFF52", alignItems: "center", justifyContent: "center", ...platformShadow({ color: "#000", opacity: 0.7, radius: 26, offsetY: 16, elevation: 12 }) },
  outerCover: { width: 104, height: 212, borderRadius: 17, borderColor: "#FFFFFF32", ...platformShadow({ color: "#000", opacity: 0.38, radius: 12, offsetY: 9, elevation: 3 }) },
  outerContactShadow: { position: "absolute", top: 202, width: 78, height: 13, borderRadius: 999, backgroundColor: "#05060B", opacity: 0.28, transform: [{ scaleY: 0.2 }] },
  outerReflection: { position: "absolute", top: 210, width: 98, height: 32, opacity: 0.07, transform: [{ scaleY: -1 }], overflow: "hidden", borderRadius: 15, alignItems: "center" },
  sideCover: { width: 136, height: 280, borderRadius: 22 },
  sideContactShadow: { position: "absolute", top: 272, width: 104, height: 17, borderRadius: 999, backgroundColor: "#05060B", opacity: 0.3, transform: [{ scaleY: 0.2 }] },
  centerCover: { width: 270, height: 382, borderRadius: 34, borderWidth: 2, borderColor: "#FFFFFFB8", ...platformShadow({ color: "#000", opacity: 0.92, radius: 38 }) },
  centerPressable: { width: "100%", height: "100%", alignItems: "center", justifyContent: "center" },
  bufferingOverlay: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center", backgroundColor: "#08090EB8", gap: 10 },
  equalizer: { height: 42, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5 },
  equalizerBar: { width: 6, height: 34, borderRadius: 3, ...platformShadow({ color: "#FFFFFF", opacity: 0.35, radius: 6, elevation: 4 }) },
  bufferingText: { color: "#F5F3EE", fontSize: 11, fontWeight: "700", letterSpacing: 0.4 },
  liveBadge: { position: "absolute", bottom: 24, left: 46, right: 46, height: 34, borderRadius: 17, borderWidth: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, ...platformShadow({ color: "#FF5E67", opacity: 0.55, radius: 12, offsetY: 5, elevation: 7 }) }, liveBadgeText: { color: "#FFFFFF", fontSize: 11, fontWeight: "800", letterSpacing: 1.4 },
  innerGlow: { ...StyleSheet.absoluteFillObject, borderRadius: 4 },
  sideShade: { ...StyleSheet.absoluteFillObject, backgroundColor: "#00000022" },
  outerShade: { ...StyleSheet.absoluteFillObject, backgroundColor: "#05060B42" },
  centerGloss: { position: "absolute", top: 9, left: 14, right: 14, height: 52, backgroundColor: "#FFFFFF12" },
  diagonalSheen: { position: "absolute", width: 280, height: 34, top: 74, left: -36, backgroundColor: "#FFFFFF18", transform: [{ rotate: "-28deg" }] },
  reflection: { position: "absolute", top: 278, width: 136, height: 46, opacity: 0.08, transform: [{ scaleY: -1 }], overflow: "hidden", borderRadius: 18, alignItems: "center" },
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
