import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AccessibilityInfo, Pressable, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  Extrapolation,
  cancelAnimation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";

import { StationLogo } from "@/components/station-logo";
import { IconSymbol } from "@/components/ui/icon-symbol";
import type { Radio } from "@/lib/radio-player";
import { safeRadioIndex, spinLandingIndex, wrapCarouselIndex } from "@/lib/player-utils";
import { nonInteractiveStyle, platformShadow } from "@/lib/platform-styles";
import { prefetchLogoWindow } from "@/lib/logo-cache";

const CARD_SIZE = 214;
const CARD_STEP = 122;
const SLOT_RADIUS = 8;
const DRAG_LIMIT = CARD_STEP * 1.2;
const SWIPE_DISTANCE = 26;
const SWIPE_VELOCITY = 300;
const MAX_GESTURE_VELOCITY = 2200;
function useSlotCardAnimatedStyle(
  slot: number,
  wheelOffset: SharedValue<number>,
  spinProgress: SharedValue<number>,
  reduceMotion: boolean,
) {
  return useAnimatedStyle(() => {
    const relative = slot + wheelOffset.get();
    const distance = Math.abs(relative);
    const clamped = Math.max(-SLOT_RADIUS - 1, Math.min(SLOT_RADIUS + 1, relative));
    const x = clamped * CARD_STEP;
    const rotation = interpolate(clamped, [-6, -4, -2, 0, 2, 4, 6], [58, 48, 28, 0, -28, -48, -58], Extrapolation.CLAMP);
    const scale = interpolate(distance, [0, 1, 2, 4, 6, 8], [1, 0.91, 0.8, 0.7, 0.58, 0.42], Extrapolation.CLAMP);
    const opacity = interpolate(distance, [0, 1, 2, 4, 6, 8], [1, 0.96, 0.72, 0.38, 0.16, 0], Extrapolation.CLAMP);
    const blur = interpolate(spinProgress.get(), [0, 0.12, 0.36, 0.82, 1], [0, 1, 3.2, 2.2, 0], Extrapolation.CLAMP);

    return {
      opacity,
      zIndex: SLOT_RADIUS - Math.min(SLOT_RADIUS, Math.round(distance)),
      // React Native 0.81 supports the filter blur style on Android and web.
      filter: [{ blur }],
      transform: [
        { perspective: 900 },
        { translateX: x },
        { rotateY: reduceMotion ? "0deg" : `${rotation}deg` },
        { scale },
      ],
    };
  }, [reduceMotion, slot, spinProgress, wheelOffset]);
}

type SlotCardProps = {
  radio: Radio;
  slot: number;
  wheelOffset: SharedValue<number>;
  spinProgress: SharedValue<number>;
  reduceMotion: boolean;
  isCenter: boolean;
  isPlaying: boolean;
  isLoading: boolean;
  currentRadioId?: string;
  onPress: () => void;
  onPlay: () => void;
};

const SlotCard = memo(function SlotCard({
  radio,
  slot,
  wheelOffset,
  spinProgress,
  reduceMotion,
  isCenter,
  isPlaying,
  isLoading,
  currentRadioId,
  onPress,
  onPlay,
}: SlotCardProps) {
  const animatedStyle = useSlotCardAnimatedStyle(slot, wheelOffset, spinProgress, reduceMotion);
  const centerGlow = useAnimatedStyle(() => ({
    opacity: isCenter ? interpolate(spinProgress.get(), [0, 1], [0.12, 0.04], Extrapolation.CLAMP) : 0,
  }), [isCenter, spinProgress]);

  return (
    <Animated.View
      renderToHardwareTextureAndroid
      shouldRasterizeIOS
      style={[styles.slot, animatedStyle]}
    >
      <Pressable
        disabled={isLoading || !onPress}
        onPress={isCenter ? onPlay : onPress}
        accessibilityRole="button"
        accessibilityLabel={
          isCenter
            ? isLoading
              ? `Conectando con ${radio.name}`
              : currentRadioId === radio.id && isPlaying
                ? `Pausar ${radio.name}`
                : `Reproducir ${radio.name}`
            : `Ir a ${radio.name}`
        }
        style={styles.cardPressable}
      >
        <View style={[styles.cardFrame, isCenter && styles.centerCardFrame, { backgroundColor: `${radio.accent}32` }]}>
          <StationLogo
            key={`slot-logo-${radio.id}:${radio.favicon ?? ""}`}
            radio={radio}
            size={CARD_SIZE - 4}
            radius={26}
          />
          <Animated.View style={[styles.cardShine, centerGlow, nonInteractiveStyle]} />
          {isCenter && <View style={[styles.centerBorder, { borderColor: `${radio.accent}A8` }]} pointerEvents="none" />}
          {isCenter && (
            <View style={[styles.liveBadge, { borderColor: `${radio.accent}CC`, backgroundColor: `${radio.accent}DD` }, nonInteractiveStyle]}>
              <IconSymbol name="waveform" size={14} color="#FFFFFF" />
              <Text style={styles.liveBadgeText}>EN VIVO</Text>
            </View>
          )}
          {isCenter && isLoading && (
            <View style={[styles.bufferingOverlay, nonInteractiveStyle]} accessible accessibilityLabel={`Buffering ${radio.name}`}>
              <Text style={styles.bufferingText}>CONECTANDO…</Text>
            </View>
          )}
        </View>
        <View style={[styles.reflection, nonInteractiveStyle]}>
          <StationLogo
            key={`slot-reflection-${radio.id}:${radio.favicon ?? ""}`}
            radio={radio}
            size={CARD_SIZE - 22}
            radius={22}
          />
          <View style={styles.reflectionFadeStrong} />
          <View style={styles.reflectionFadeSoft} />
        </View>
      </Pressable>
    </Animated.View>
  );
});

export function CoverFlowCarousel({
  radios,
  activeIndex,
  onSelect,
  onPlay,
  isPlaying,
  isLoading,
  currentRadioId,
  lightMode = false,
}: {
  radios: Radio[];
  activeIndex: number;
  onSelect: (radio: Radio) => void;
  onPlay: () => void;
  isPlaying: boolean;
  isLoading: boolean;
  currentRadioId?: string;
  lightMode?: boolean;
}) {
  const wheelOffset = useSharedValue(0);
  const spinProgress = useSharedValue(0);
  const spinning = useSharedValue(0);
  const isMounted = useSharedValue(true);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(() => safeRadioIndex(radios.length, activeIndex));
  const selectedIndexRef = useRef(selectedIndex);
  const isSpinningRef = useRef(false);
  const awaitingParentSyncRef = useRef(false);

  const safeActiveIndex = safeRadioIndex(radios.length, activeIndex);
  const renderIndex = safeRadioIndex(radios.length, selectedIndex);
  const active = renderIndex >= 0 ? radios[renderIndex] : undefined;
  const slotValues = useMemo(() => Array.from({ length: SLOT_RADIUS * 2 + 1 }, (_, index) => index - SLOT_RADIUS), []);

  const setSelected = useCallback((index: number) => {
    const nextIndex = wrapCarouselIndex(index, radios.length);
    const nextRadio = radios[nextIndex];
    if (!nextRadio || !isMounted.get()) return;

    selectedIndexRef.current = nextIndex;
    awaitingParentSyncRef.current = true;
    isSpinningRef.current = false;
    setIsSpinning(false);
    spinning.set(0);
    spinProgress.set(0);
    wheelOffset.set(0);
    setSelectedIndex(nextIndex);
    onSelect(nextRadio);
  }, [isMounted, onSelect, radios, spinProgress, spinning, wheelOffset]);

  const commitSlot = useCallback((slot: number) => {
    setSelected(selectedIndexRef.current + slot);
  }, [setSelected]);

  const selectSlot = useCallback((slot: number) => {
    if (!active || radios.length < 2 || isSpinningRef.current) return;
    const boundedSlot = Math.max(-SLOT_RADIUS, Math.min(SLOT_RADIUS, Math.round(slot)));
    if (boundedSlot === 0) return;
    if (reduceMotion) {
      setSelected(selectedIndexRef.current + boundedSlot);
      return;
    }

    cancelAnimation(wheelOffset);
    wheelOffset.set(withTiming(-boundedSlot, {
      duration: 300 + Math.abs(boundedSlot) * 70,
      easing: Easing.bezier(0.18, 0.82, 0.22, 1),
    }, (finished) => {
      if (finished && isMounted.get()) runOnJS(commitSlot)(boundedSlot);
    }));
  }, [active, commitSlot, isMounted, radios.length, reduceMotion, setSelected, wheelOffset]);

  const spin = useCallback(() => {
    if (!active || radios.length < 2 || isSpinningRef.current) return;
    const maxExtra = Math.max(0, Math.min(radios.length - 1, SLOT_RADIUS - 6));
    const targetSlots = 6 + (maxExtra > 0 ? Math.floor(Math.random() * (maxExtra + 1)) : 0);
    const finalIndex = spinLandingIndex(selectedIndexRef.current, targetSlots, radios.length);

    if (reduceMotion) {
      setSelected(finalIndex);
      return;
    }

    isSpinningRef.current = true;
    setIsSpinning(true);
    spinning.set(1);
    spinProgress.set(withSequence(
      withTiming(0.12, { duration: 320, easing: Easing.out(Easing.cubic) }),
      withTiming(0.82, { duration: 2200, easing: Easing.linear }),
      withTiming(1, { duration: 780, easing: Easing.out(Easing.cubic) }),
    ));
    wheelOffset.set(withSequence(
      withTiming(-targetSlots * 0.12, { duration: 320, easing: Easing.in(Easing.cubic) }),
      withTiming(-targetSlots * 0.82, { duration: 2200, easing: Easing.linear }),
      withTiming(-targetSlots, { duration: 780, easing: Easing.out(Easing.cubic) }, (finished) => {
        if (finished && isMounted.get()) runOnJS(setSelected)(finalIndex);
      }),
    ));
  }, [active, isMounted, radios.length, reduceMotion, setSelected, spinProgress, spinning, wheelOffset]);

  useEffect(() => {
    if (safeActiveIndex < 0) return;
    // Solo sincronizar si el índice externo difiere y no estamos en medio de
    // una animación interna o esperando confirmación del padre.
    if (safeActiveIndex === selectedIndexRef.current) {
      awaitingParentSyncRef.current = false;
      return;
    }
    // Durante el buffering/loading o selección manual, evitar forzar sincronización
    if (isSpinningRef.current || awaitingParentSyncRef.current || isLoading) return;
    selectedIndexRef.current = safeActiveIndex;
    setSelectedIndex(safeActiveIndex);
    wheelOffset.set(0);
  }, [safeActiveIndex, wheelOffset]);

  useEffect(() => {
    isMounted.set(true);
    return () => {
      isMounted.set(false);
      isSpinningRef.current = false;
      spinning.set(0);
      cancelAnimation(wheelOffset);
      cancelAnimation(spinProgress);
    };
  }, [isMounted, spinProgress, spinning, wheelOffset]);

  useEffect(() => {
    if (renderIndex < 0 || radios.length < 1) return;
    const handle = setTimeout(() => {
      void prefetchLogoWindow(radios, renderIndex, 5);
    }, 80);
    return () => clearTimeout(handle);
  }, [radios, renderIndex]);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion).catch(() => undefined);
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotion);
    return () => subscription.remove();
  }, []);


  const panGesture = useMemo(() => Gesture.Pan()
    .activeOffsetX([-3, 3])
    .failOffsetY([-18, 18])
    .shouldCancelWhenOutside(false)
    .onBegin(() => {
      if (!isMounted.get() || spinning.get() > 0) return;
      cancelAnimation(wheelOffset);
    })
    .onUpdate((event) => {
      if (!isMounted.get() || spinning.get() > 0 || reduceMotion) return;
      const translation = Math.max(-DRAG_LIMIT, Math.min(DRAG_LIMIT, event.translationX));
      wheelOffset.set(translation / CARD_STEP);
    })
    .onEnd((event) => {
      if (!isMounted.get() || spinning.get() > 0) return;
      const limitedVelocity = Math.max(-MAX_GESTURE_VELOCITY, Math.min(MAX_GESTURE_VELOCITY, event.velocityX));
      const projectedTranslation = event.translationX + limitedVelocity * 0.2;
      const slot = Math.abs(projectedTranslation) < SWIPE_DISTANCE && Math.abs(limitedVelocity) < SWIPE_VELOCITY
        ? 0
        : projectedTranslation < 0 ? 1 : -1;

      if (slot === 0 || reduceMotion) {
        if (reduceMotion && slot !== 0) runOnJS(commitSlot)(slot);
        else wheelOffset.set(withTiming(0, { duration: 220, easing: Easing.out(Easing.cubic) }));
        return;
      }

      wheelOffset.set(withTiming(-slot, {
        duration: 330,
        easing: Easing.out(Easing.cubic),
      }, (finished) => {
        if (finished && isMounted.get()) runOnJS(commitSlot)(slot);
      }));
    }), [commitSlot, isMounted, reduceMotion, spinning, wheelOffset]);

  if (!active) return null;

  return (
    <GestureDetector gesture={panGesture}>
      <View style={[styles.root, lightMode && styles.rootLight]} accessibilityLabel="Radio slot machine carousel">
        <View style={styles.stage}>
          <View style={[styles.trackHint, nonInteractiveStyle]} />
          {slotValues.map((slot) => {
            const radio = radios[wrapCarouselIndex(renderIndex + slot, radios.length)];
            if (!radio) return null;
            return (
              <SlotCard
                // El slot representa una posición física del tambor; su key no debe
                // depender de la emisora, o React desmonta todas las carátulas al cambiar índice.
                key={`slot-${slot}`}
                radio={radio}
                slot={slot}
                wheelOffset={wheelOffset}
                spinProgress={spinProgress}
                reduceMotion={reduceMotion}
                isCenter={slot === 0}
                isPlaying={isPlaying}
                // Durante el handoff el centro ya representa la próxima emisora,
                // aunque el provider aún conserve por un instante el id anterior.
                isLoading={isLoading && (slot === 0 || currentRadioId === radio.id)}
                currentRadioId={currentRadioId}
                onPress={() => selectSlot(slot)}
                onPlay={onPlay}
              />
            );
          })}
          <View style={[styles.selectionMarker, { borderColor: `${active.accent}B8` }, nonInteractiveStyle]}>
            <View style={[styles.markerPointer, { backgroundColor: active.accent }]} />
          </View>
        </View>

        <View style={styles.captionRow}>
          <Pressable onPress={() => selectSlot(-1)} disabled={isSpinning} accessibilityRole="button" accessibilityLabel="Previous station" style={({ pressed }) => [styles.arrow, pressed && styles.pressed]}>
            <IconSymbol name="chevron.left" size={20} color="#F5F3EE" />
          </Pressable>
          <View style={styles.caption}>
            <Text style={[styles.stationName, lightMode && styles.stationNameLight]} numberOfLines={1}>{active.name}</Text>
            <Text style={[styles.stationMeta, lightMode && styles.stationMetaLight]}>{active.frequency}  ·  {active.genre}</Text>
            <Text style={styles.counter}>{renderIndex + 1} / {radios.length}</Text>
          </View>
          <Pressable onPress={() => selectSlot(1)} disabled={isSpinning} accessibilityRole="button" accessibilityLabel="Next station" style={({ pressed }) => [styles.arrow, pressed && styles.pressed]}>
            <IconSymbol name="chevron.right" size={20} color="#F5F3EE" />
          </Pressable>
        </View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  root: { height: 472, borderRadius: 0, overflow: "visible", backgroundColor: "transparent", borderWidth: 0, marginBottom: 18, paddingTop: 8 },
  rootLight: { backgroundColor: "transparent", borderColor: "transparent" },
  stage: { height: 322, alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" },
  trackHint: { position: "absolute", left: -80, right: -80, top: 155, height: 82, borderRadius: 80, borderWidth: 1, borderColor: "#FFFFFF10", backgroundColor: "#FFFFFF04", transform: [{ rotate: "-2deg" }] },
  slot: { position: "absolute", top: 34, left: "50%", marginLeft: -CARD_SIZE / 2, width: CARD_SIZE, height: CARD_SIZE + 48, alignItems: "center" },
  cardPressable: { width: CARD_SIZE, height: CARD_SIZE + 48, alignItems: "center" },
  cardFrame: { width: CARD_SIZE, height: CARD_SIZE, borderRadius: 26, overflow: "hidden", borderWidth: 1, borderColor: "#FFFFFF52", alignItems: "center", justifyContent: "center", ...platformShadow({ color: "#000", opacity: 0.7, radius: 26, offsetY: 15, elevation: 10 }) },
  centerCardFrame: { borderWidth: 2, ...platformShadow({ color: "#000", opacity: 0.92, radius: 34, offsetY: 18, elevation: 14 }) },
  centerBorder: { ...StyleSheet.absoluteFillObject, borderWidth: 2, borderRadius: 24 },
  cardShine: { ...StyleSheet.absoluteFillObject, backgroundColor: "#FFFFFF10" },
  liveBadge: { position: "absolute", bottom: 16, left: 52, right: 52, height: 30, borderRadius: 15, borderWidth: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, ...platformShadow({ color: "#FF5E67", opacity: 0.55, radius: 12, offsetY: 5, elevation: 7 }) },
  liveBadgeText: { color: "#FFFFFF", fontSize: 10, fontWeight: "800", letterSpacing: 1.4 },
  bufferingOverlay: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center", backgroundColor: "#08090EB8" },
  bufferingText: { color: "#F5F3EE", fontSize: 11, fontWeight: "800", letterSpacing: 0.6 },
  reflection: { width: CARD_SIZE - 24, height: 35, marginTop: 6, opacity: 0.08, transform: [{ scaleY: -1 }], overflow: "hidden", borderRadius: 20, alignItems: "center" },
  reflectionFadeStrong: { position: "absolute", left: 0, right: 0, top: 0, height: 10, backgroundColor: "#070811", opacity: 0.26 },
  reflectionFadeSoft: { position: "absolute", left: 0, right: 0, bottom: 0, height: 22, backgroundColor: "#070811", opacity: 0.58 },
  selectionMarker: { position: "absolute", top: 26, left: "50%", marginLeft: -(CARD_SIZE + 14) / 2, width: CARD_SIZE + 14, height: CARD_SIZE + 14, borderWidth: 1.5, borderRadius: 30, backgroundColor: "transparent" },
  markerPointer: { position: "absolute", top: -5, left: (CARD_SIZE + 14) / 2 - 5, width: 10, height: 10, borderRadius: 3, transform: [{ rotate: "45deg" }], ...platformShadow({ color: "#FF6B5A", opacity: 0.8, radius: 9, elevation: 5 }) },
  captionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, marginTop: 7 },
  caption: { flex: 1, alignItems: "center", paddingHorizontal: 12 },
  stationName: { color: "#F5F3EE", fontSize: 24, fontWeight: "700", letterSpacing: -0.5 },
  stationNameLight: { color: "#F5F3EE" },
  stationMeta: { color: "#B7C0D0", fontSize: 12, marginTop: 5 },
  stationMetaLight: { color: "#B7C0D0" },
  counter: { color: "#FF6B5A", fontSize: 10, fontWeight: "700", marginTop: 6 },
  arrow: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#FFFFFF14", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#FFFFFF1C" },
  actionRow: { alignItems: "center", justifyContent: "center", marginTop: 8 },
  spinButton: { height: 36, paddingHorizontal: 18, borderRadius: 18, backgroundColor: "#FF6B5A", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, ...platformShadow({ color: "#FF6B5A", opacity: 0.32, radius: 12, offsetY: 5, elevation: 5 }) },
  spinButtonBusy: { backgroundColor: "#E2A09A" },
  spinButtonText: { color: "#160F14", fontSize: 11, fontWeight: "900", letterSpacing: 1.3 },
  dots: { flexDirection: "row", justifyContent: "center", gap: 7, marginTop: 9 },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: "#687184" },
  dotActive: { width: 18, backgroundColor: "#FF6B5A" },
  pressed: { opacity: 0.62, transform: [{ scale: 0.94 }] },
});
